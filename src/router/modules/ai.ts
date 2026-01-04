import { DashboardIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/ai',
    name: 'ai',
    component: Layout,
    redirect: '/ai/base',
    meta: {
      title: {
        zh_CN: 'AI模块',
        en_US: 'AI Module',
      },
      icon: shallowRef(DashboardIcon),
      orderNo: -1,
    },
    children: [
      {
        path: 'base',
        name: 'AIBase',
        component: () => import('@/pages/ai/base/index.vue'),
        meta: {
          title: {
            zh_CN: 'AI-对话',
            en_US: 'AI-Chat',
          },
        },
      },
      // {
      //   path: 'chat',
      //   name: 'AIChat',
      //   component: () => import('@/pages/ai/chat/index.vue'),
      //   meta: {
      //     title: {
      //       zh_CN: 'AI对话',
      //       en_US: 'AI Chat',
      //     },
      //   },
      // },
    ],
  },
];
