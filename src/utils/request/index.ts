import type { AxiosInstance } from 'axios';
import isString from 'lodash/isString';
import merge from 'lodash/merge';

import { ContentTypeEnum } from '@/constants';
import router from '@/router';
import { useUserStore } from '@/store';

import { VAxios } from './Axios';
import type { AxiosTransform, CreateAxiosOptions } from './AxiosTransform';
import { formatRequestDate, joinTimestamp, setObjToUrlParams } from './utils';

const env = import.meta.env.MODE || 'development';
// 开发环境强制走相对路径，由 Vite 代理到本地网关，避免误打远端地址。
const useDirectApiHost = !['development', 'mock'].includes(env) && import.meta.env.VITE_IS_REQUEST_PROXY === 'true';
const host = useDirectApiHost ? import.meta.env.VITE_API_URL : '';

// 刷新 token 时，后续 401 请求会先进入等待队列，等 refresh 成功后再统一重放。
let isRefreshingToken = false;
interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}
let pendingRequests: PendingRequest[] = [];

const transform: AxiosTransform = {
  transformRequestHook: (res, options) => {
    // 统一拆解后端响应结构，页面层默认只拿 data，不再重复判断 code/message。
    const { isTransformResponse, isReturnNativeResponse } = options;
    const method = res.config.method?.toLowerCase();

    if (res.status === 204 && ['put', 'patch', 'delete'].includes(method || '')) {
      return res;
    }
    if (isReturnNativeResponse) {
      return res;
    }
    if (!isTransformResponse) {
      return res.data;
    }

    const { data } = res;
    if (!data) {
      throw new Error('请求接口错误');
    }

    if (data.code === 0) {
      return data.data;
    }

    throw new Error(data.message || `请求接口错误, 错误码: ${data.code}`);
  },

  beforeRequestHook: (config, options) => {
    // 所有请求在这里统一拼接前缀、query、body 以及时间戳参数。
    const { apiUrl, isJoinPrefix, urlPrefix, joinParamsToUrl, formatDate, joinTime = true } = options;

    if (isJoinPrefix && urlPrefix && isString(urlPrefix)) {
      config.url = `${urlPrefix}${config.url}`;
    }
    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }

    const params = config.params || {};
    const data = config.data || false;

    if (formatDate && data && !isString(data)) {
      formatRequestDate(data);
    }

    if (config.method?.toUpperCase() === 'GET') {
      if (!isString(params)) {
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        config.url = `${config.url + params}${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else if (!isString(params)) {
      if (formatDate) {
        formatRequestDate(params);
      }
      if (
        Reflect.has(config, 'data') &&
        config.data &&
        (Object.keys(config.data).length > 0 || data instanceof FormData)
      ) {
        config.data = data;
        config.params = params;
      } else {
        config.data = params;
        config.params = undefined;
      }
      if (joinParamsToUrl) {
        config.url = setObjToUrlParams(config.url as string, { ...config.params, ...config.data });
      }
    } else {
      config.url += params;
      config.params = undefined;
    }
    return config;
  },

  requestInterceptors: (config, options) => {
    const userStore = useUserStore();
    const { token } = userStore;
    // 默认自动携带 Bearer token，公共认证接口会通过 withToken=false 主动关闭。
    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      (config as Recordable).headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token;
    }
    return config;
  },

  responseInterceptors: (res) => res,

  responseInterceptorsCatch: async (error: any, instance: AxiosInstance) => {
    // 响应错误统一在这里兜底处理，尤其是 token 过期后的刷新与回跳登录逻辑。
    const { config } = error;
    const userStore = useUserStore();
    const status = error?.response?.status;
    const requestUrl = config?.url || '';
    const isRefreshApi = requestUrl.includes('/iam/auth/refresh');
    const isPublicAuthApi = ['/iam/auth/login', '/iam/auth/register'].some((api) => requestUrl.includes(api));

    if (status === 401 && !isRefreshApi && !isPublicAuthApi && userStore.refreshToken) {
      if (isRefreshingToken) {
        // 已经有人在刷新 token 时，当前请求先挂起，避免并发触发多次 refresh。
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: (token: string) => {
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
              };
              resolve(instance.request(config));
            },
            reject,
          });
        });
      }

      isRefreshingToken = true;
      try {
        const newToken = await userStore.refreshTokenAction();
        // refresh 成功后，先唤醒等待队列，再重放当前失败请求。
        pendingRequests.forEach((request) => request.resolve(newToken));
        pendingRequests = [];
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return instance.request(config);
      } catch (refreshError: any) {
        const normalizedError = refreshError instanceof Error ? refreshError : new Error('登录已失效，请重新登录');
        pendingRequests.forEach((request) => request.reject(normalizedError));
        pendingRequests = [];
        await userStore.logout(false);
        if (router.currentRoute.value.path !== '/login') {
          await router.push({
            path: '/login',
            query: { redirect: encodeURIComponent(router.currentRoute.value.fullPath) },
          });
        }
        return Promise.reject(normalizedError);
      } finally {
        isRefreshingToken = false;
      }
    }

    if ((status === 401 || status === 403) && router.currentRoute.value.path !== '/login') {
      // 没有可用 refreshToken 或权限不足时，直接清掉本地状态并回登录页。
      await userStore.logout(false);
      await router.push({
        path: '/login',
        query: { redirect: encodeURIComponent(router.currentRoute.value.fullPath) },
      });
    }

    if (!config || !config.requestOptions.retry) {
      return Promise.reject(new Error(error?.response?.data?.message || error.message || '请求失败'));
    }

    config.retryCount = config.retryCount || 0;
    // 与登录态刷新无关的错误才走这里的通用重试。
    if (config.retryCount >= config.requestOptions.retry.count) {
      return Promise.reject(new Error(error?.response?.data?.message || error.message || '请求失败'));
    }

    config.retryCount += 1;
    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve(config);
      }, config.requestOptions.retry.delay || 1);
    });
    config.headers = { ...config.headers, 'Content-Type': ContentTypeEnum.Json };
    return backoff.then((requestConfig) => instance.request(requestConfig as any));
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    merge(
      <CreateAxiosOptions>{
        // 整个项目统一使用 Bearer token 与网关/IAM 约定保持一致。
        authenticationScheme: 'Bearer',
        timeout: 10 * 1000,
        withCredentials: true,
        headers: { 'Content-Type': ContentTypeEnum.Json },
        transform,
        requestOptions: {
          apiUrl: host,
          isJoinPrefix: true,
          urlPrefix: import.meta.env.VITE_API_URL_PREFIX,
          isReturnNativeResponse: false,
          isTransformResponse: true,
          joinParamsToUrl: false,
          formatDate: true,
          joinTime: true,
          ignoreCancelToken: true,
          withToken: true,
          retry: {
            count: 3,
            delay: 1000,
          },
        },
      },
      opt || {},
    ),
  );
}

export const request = createAxios();
