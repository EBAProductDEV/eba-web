import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

import type { RouteItem } from '@/api/model/permissionModel';
import { getMenuList } from '@/api/permission';
import router, { fixedRouterList, homepageRouterList } from '@/router';
import { store } from '@/store';
import { transformObjectToRoute } from '@/utils/route';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: ['/login'],
    routers: [],
    removeRoutes: [],
    asyncRoutes: [],
  }),
  actions: {
    async initRoutes() {
      // 最终路由 = 首页固定路由 + 后端动态菜单路由 + 框架固定路由。
      const accessedRouters = this.asyncRoutes;
      this.routers = [...homepageRouterList, ...accessedRouters, ...fixedRouterList];
    },
    async buildAsyncRoutes() {
      try {
        // 动态菜单由 IAM 后端返回，前端只负责把菜单结构转换成 vue-router 可识别的路由。
        const menuData = await getMenuList();
        const asyncRoutes: Array<RouteItem> = Array.isArray(menuData?.list) ? menuData.list : [];
        this.asyncRoutes = transformObjectToRoute(asyncRoutes);
        await this.initRoutes();
        return this.asyncRoutes;
      } catch (error) {
        console.error("Can't build routes, fallback to fixed routes.", error);
        this.asyncRoutes = [];
        await this.initRoutes();
        return this.asyncRoutes;
      }
    },
    async restoreRoutes() {
      // 退出登录或重新初始化权限时，需要把之前动态注入的路由清掉，防止菜单残留。
      this.asyncRoutes.forEach((item: RouteRecordRaw) => {
        if (item.name) {
          router.removeRoute(item.name);
        }
      });
      this.asyncRoutes = [];
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
