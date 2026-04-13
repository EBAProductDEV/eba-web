import { getAuthMenus } from '@/api/auth';
import type { MenuListResult } from '@/api/model/permissionModel';

export function getMenuList() {
  return getAuthMenus() as Promise<MenuListResult>;
}
