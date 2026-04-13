import type {
  ResetPasswordParams,
  SaveUserParams,
  UpdateUserStatusParams,
  UserListQuery,
  UserListResult,
} from '@/api/model/userAdminModel';
import { request } from '@/utils/request';

// 用户管理接口统一收口在这里，页面层只关心“调哪个方法”，不关心 URL 细节。
const Api = {
  users: '/iam/users',
};

export function getUserPage(params: UserListQuery) {
  // 分页查询走 GET，并把当前筛选条件一并作为 query 参数传给后端。
  return request.get<UserListResult>({
    url: Api.users,
    params,
  });
}

export function createUser(data: SaveUserParams) {
  return request.post<void>({
    url: Api.users,
    data,
  });
}

export function updateUser(id: number, data: SaveUserParams) {
  return request.put<void>({
    url: `${Api.users}/${id}`,
    data,
  });
}

export function updateUserStatus(id: number, data: UpdateUserStatusParams) {
  return request.put<void>({
    url: `${Api.users}/${id}/status`,
    data,
  });
}

export function resetUserPassword(id: number, data: ResetPasswordParams) {
  return request.put<void>({
    url: `${Api.users}/${id}/reset-password`,
    data,
  });
}
