export interface UserListQuery {
  pageNum: number;
  pageSize: number;
  userName?: string;
  trueName?: string;
  mobile?: string;
  roleCode?: string;
  status?: string;
}

export interface UserListItem {
  id: number;
  userName: string;
  trueName: string;
  mobile?: string;
  email?: string;
  roleCode: string;
  status: string;
  loginTime?: string;
  createTime?: string;
}

export interface UserListResult {
  pageNum: number;
  pageSize: number;
  total: number;
  list: UserListItem[];
}

export interface SaveUserParams {
  userName: string;
  trueName: string;
  mobile: string;
  email?: string;
  password?: string;
  trueNameEn?: string;
  gender?: string;
  birth?: string;
  tel?: string;
  addr?: string;
  postCode?: string;
  identityType?: string;
  identityNum?: string;
  logo?: string;
  remark?: string;
  status: string;
  roleCode: string;
}

export interface UpdateUserStatusParams {
  status: string;
}

export interface ResetPasswordParams {
  newPassword: string;
}
