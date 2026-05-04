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
      {
        path: 'drama',
        name: 'AIDrama',
        component: () => import('@/pages/ai/drama/index.vue'),
        meta: {
          title: {
            zh_CN: 'AI短剧',
            en_US: 'AI Drama',
          },
        },
      },
      {
        path: 'drama/projects/:id',
        name: 'AIDramaDetail',
        component: () => import('@/pages/ai/drama/detail.vue'),
        meta: {
          title: {
            zh_CN: '短剧项目详情',
            en_US: 'Drama Project Detail',
          },
          hidden: true,
        },
      },
      {
        path: 'drama/projects/:id/story',
        name: 'AIDramaStory',
        component: () => import('@/pages/ai/drama/story.vue'),
        meta: {
          title: {
            zh_CN: '故事总纲',
            en_US: 'Drama Story',
          },
          hidden: true,
        },
      },
      {
        path: 'drama/projects/:id/characters/:characterId',
        name: 'AIDramaCharacterDetail',
        component: () => import('@/pages/ai/drama/character/detail.vue'),
        meta: {
          title: {
            zh_CN: '短剧角色详情',
            en_US: 'Drama Character Detail',
          },
          hidden: true,
        },
      },
      {
        path: 'drama/projects/:id/episodes/:episodeId',
        name: 'AIDramaEpisodeDetail',
        component: () => import('@/pages/ai/drama/episode/detail.vue'),
        meta: {
          title: {
            zh_CN: '短剧单集详情',
            en_US: 'Drama Episode Detail',
          },
          hidden: true,
        },
      },
    ],
  },
];
