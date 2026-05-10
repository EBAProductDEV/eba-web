import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { ConfigEnv, UserConfig } from 'vite';
import { loadEnv } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import svgLoader from 'vite-svg-loader';

const CWD = process.cwd();

export default ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_BASE_URL } = loadEnv(mode, CWD);
  const proxy = {
    '/api': {
      target: 'http://localhost:10080',
      changeOrigin: true,
      ws: true,
    },
  };

  return {
    base: VITE_BASE_URL,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${path.resolve('src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
    },

    plugins: [
      vue(),
      vueJsx(),
      viteMockServe({
        mockPath: 'mock',
        enable: false,
      }),
      svgLoader(),
    ],

    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['t2eff2cf.natappfree.cc'],
      proxy,
    },
    preview: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['t2eff2cf.natappfree.cc'],
      proxy,
    },
  };
};
