import { defineStore } from 'pinia';

import {
  getProfile,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  register as registerApi,
} from '@/api/auth';
import type { LoginParams, RegisterParams } from '@/api/model/authModel';
import { usePermissionStore } from '@/store';
import type { UserInfo } from '@/types/interface';

// 用户信息默认值统一从这里生成，避免各处手写空对象。
const initUserInfo = (): UserInfo => ({
  name: '',
  roles: [],
});

export const useUserStore = defineStore('user', {
  state: () => ({
    // access token，供请求拦截器统一拼接到 Authorization。
    token: '',
    // refresh token，在 access token 失效时用于续期。
    refreshToken: '',
    // 当前登录用户资料，也是角色与菜单判断的基础数据。
    userInfo: initUserInfo(),
  }),
  getters: {
    roles: (state) => state.userInfo?.roles || [],
  },
  actions: {
    async login(params: LoginParams) {
      // 登录成功后一次性写入 token、refreshToken 与用户资料。
      const result = await loginApi(params);
      this.token = result.accessToken;
      this.refreshToken = result.refreshToken;
      this.userInfo = { ...result.userInfo };
      return result;
    },
    async register(params: RegisterParams) {
      return registerApi(params);
    },
    // 这里只负责刷新 token，本身不处理页面跳转；跳转由请求层统一控制。
    async refreshTokenAction() {
      if (!this.refreshToken) {
        throw new Error('登录已失效，请重新登录');
      }
      const result = await refreshTokenApi({ refreshToken: this.refreshToken });
      this.token = result.accessToken;
      this.refreshToken = result.refreshToken;
      this.userInfo = { ...result.userInfo };
      return result.accessToken;
    },
    // 页面刷新后如果本地还保留 token，可以通过 profile 接口重新同步一份用户资料。
    async getUserInfo() {
      if (!this.token) {
        throw new Error('未登录');
      }
      const result = await getProfile();
      this.userInfo = { ...result };
      return result;
    },
    // callRemote=false 常用于 token 已失效场景，此时只需要清理本地状态。
    async logout(callRemote = true) {
      if (callRemote && this.token) {
        try {
          await logoutApi();
        } catch {
          // ignore logout errors so local cleanup still happens
        }
      }
      this.token = '';
      this.refreshToken = '';
      this.userInfo = initUserInfo();
    },
  },
  persist: {
    afterRestore: () => {
      // 恢复本地缓存后，需要把动态路由重新灌回去，否则刷新页面后菜单会丢失。
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes();
    },
    key: 'user',
    paths: ['token', 'refreshToken', 'userInfo'],
  },
});
