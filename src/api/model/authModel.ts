export interface AuthUserInfo {
  id: number;
  userName: string;
  trueName: string;
  name: string;
  mobile?: string;
  email?: string;
  roleCode: string;
  status: string;
  logo?: string;
  gender?: string;
  birth?: string;
  tel?: string;
  addr?: string;
  postCode?: string;
  identityType?: string;
  identityNum?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  loginTime?: string;
  roles: string[];
}

export interface LoginParams {
  userName: string;
  password: string;
}

export interface RegisterParams {
  userName: string;
  trueName: string;
  mobile: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenParams {
  refreshToken: string;
}

export interface AuthTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userInfo: AuthUserInfo;
}
