import type {
  AuthTokenResult,
  AuthUserInfo,
  LoginParams,
  RefreshTokenParams,
  RegisterParams,
} from '@/api/model/authModel';
import type { MenuListResult } from '@/api/model/permissionModel';
import { request } from '@/utils/request';

// 认证相关接口统一收口在这里，页面和 store 不直接拼接 URL。
const Api = {
  login: '/iam/auth/login',
  register: '/iam/auth/register',
  refresh: '/iam/auth/refresh',
  logout: '/iam/auth/logout',
  profile: '/iam/auth/profile',
  menus: '/iam/auth/menus',
};

export function login(params: LoginParams) {
  return request.post<AuthTokenResult>(
    {
      url: Api.login,
      data: params,
      // 登录前本地还没有 token，因此显式关闭自动带 token。
    },
    { withToken: false },
  );
}

export function register(params: RegisterParams) {
  return request.post<void>(
    {
      url: Api.register,
      data: params,
      // 注册同样属于匿名接口。
    },
    { withToken: false },
  );
}

export function refreshToken(params: RefreshTokenParams) {
  return request.post<AuthTokenResult>(
    {
      url: Api.refresh,
      data: params,
      // refresh 时不能继续带旧 access token，避免被后端误判成普通鉴权请求。
    },
    { withToken: false },
  );
}

export function logout() {
  return request.post<void>({
    url: Api.logout,
  });
}

export function getProfile() {
  return request.get<AuthUserInfo>({
    url: Api.profile,
  });
}

export function getAuthMenus() {
  return request.get<MenuListResult>({
    url: Api.menus,
  });
}
