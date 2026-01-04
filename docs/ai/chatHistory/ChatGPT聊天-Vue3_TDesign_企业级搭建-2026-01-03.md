# Vue3 TDesign 企业级搭建

#### You:
<time datetime="2026-01-03T09:13:09.468Z" title="2026/1/3 17:13:09">17:13</time>

我想要用vue3+TDesign+vite+Ts，构建一个前端项目，要求用TDesign的最佳实践，创建项目，请告诉我企业级详细步骤

#### ChatGPT:
<time datetime="2026-01-03T09:13:24.617Z" title="2026/1/3 17:13:24">17:13</time>

好的，我给你整理一个**企业级前端项目搭建流程**，使用 **Vue 3 + Vite + TypeScript + TDesign**，并尽量符合 TDesign 的官方最佳实践。步骤会尽量详细到企业开发级别，包括文件结构、依赖管理、组件规范、路由、状态管理等。

---

## **1. 环境准备**

- Node.js：>=18
- npm / pnpm / yarn（推荐 pnpm，快、节省空间）

验证：

```bash
node -v
pnpm -v
```

如果没有 pnpm，可以安装：

```bash
npm install -g pnpm
```

---

## **2. 创建项目**

使用 Vite 创建 Vue 3 + TS 项目：

```bash
pnpm create vite@latest my-enterprise-app
# 选择：
# 框架: vue
# 语言: typescript
```

进入项目：

```bash
cd my-enterprise-app
pnpm install
```

---

## **3. 安装 TDesign**

安装 TDesign Vue 3 版本：

```bash
pnpm add tdesign-vue-next tdesign-icons-vue-next
```

可选：安装样式预处理器（SCSS/SASS）：

```bash
pnpm add -D sass
```

---

## **4. 配置全局样式和 TDesign**

在 `main.ts` 中引入 TDesign 样式和组件：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// TDesign
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(TDesign)

app.mount('#app')
```

---

## **5. 项目目录结构（企业级规范）**

推荐结构：

```
my-enterprise-app/
├─ public/               # 公共静态资源
├─ src/
│  ├─ api/               # 后端接口封装
│  ├─ assets/            # 图片、字体等静态资源
│  ├─ components/        # 公共组件
│  │   └─ base/          # 基础组件，如Button/Input
│  │   └─ business/      # 业务组件
│  ├─ composables/       # Vue3 composition API hooks
│  ├─ layouts/           # 页面布局组件，如主布局、空白布局
│  ├─ router/            # 路由配置
│  ├─ store/             # Pinia 或 Vuex 状态管理
│  ├─ styles/            # 全局样式、变量、mixins
│  ├─ utils/             # 工具函数
│  ├─ views/             # 页面视图
│  ├─ App.vue
│  └─ main.ts
├─ .eslintrc.js          # ESLint
├─ .prettierrc           # Prettier
├─ tsconfig.json
├─ vite.config.ts
└─ package.json
```

---

## **6. 路由（Router）配置**

使用 Vue Router 4：

```bash
pnpm add vue-router@4
```

示例：`src/router/index.ts`

```ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

企业级建议：

- 使用**懒加载 + 路由分组**
- 路由 meta 字段存放权限、标题等信息

---

## **7. 状态管理**

企业级推荐使用 **Pinia**（Vue 官方推荐，轻量、TypeScript 支持好）：

```bash
pnpm add pinia
```

创建 `src/store/index.ts`：

```ts
import { createPinia } from 'pinia'

const store = createPinia()

export default store
```

示例 store：`src/store/user.ts`

```ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    name: ''
  }),
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setName(name: string) {
      this.name = name
    }
  }
})
```

---

## **8. 接口封装**

企业级推荐统一管理接口：

`src/api/http.ts`（Axios 封装）：

```ts
import axios from 'axios'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(config => {
  // 可加 token
  return config
})

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default service
```

`src/api/user.ts`：

```ts
import request from './http'

export const login = (params: { username: string; password: string }) =>
  request.post('/login', params)
```

---

## **9. TDesign 使用规范**

1. **基础组件封装**
   - 所有 Button、Input、Select 封装到 `components/base`
   - 避免直接全局使用 TDesign 组件，便于样式统一和二次封装

2. **业务组件**
   - 放到 `components/business`
   - 尽量拆分小组件，单一职责

3. **样式规范**
   - 全局变量：`styles/variables.scss`
   - 混入函数：`styles/mixins.scss`
   - 所有组件使用 SCSS module 或 `:deep` 控制局部样式

---

## **10. Vite 配置优化（企业级）**

`vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
```

---

## **11. 企业级开发最佳实践**

1. **TypeScript 全面使用**
   - 接口、类型、枚举都用 TS 定义
2. **代码规范**
   - ESLint + Prettier
   - 推荐规则：`plugin:vue/vue3-recommended`, `@typescript-eslint/recommended`
3. **组件命名**
   - `PascalCase`
   - 基础组件加 `Base` 前缀，例如 `BaseButton`
4. **布局与页面**
   - 使用 TDesign 布局组件：`TLayout / THeader / TSider / TContent / TFooter`
   - 页面与布局解耦，支持多种布局切换
5. **懒加载 + 按需加载**
   - Vue Router 路由懒加载
   - TDesign 按需加载组件（或封装全局组件库）
6. **环境区分**
   - `.env`, `.env.production`, `.env.development`
7. **国际化**（可选）
   - `vue-i18n` + TDesign 支持多语言

---

## **12. 启动项目**

```bash
pnpm dev
# 生产构建
pnpm build
```

浏览器访问：`http://localhost:5173`

---

如果你愿意，我可以帮你**直接生成一个企业级模板项目目录 + 示例代码**，里面包含 TDesign 布局、路由、Pinia 状态管理、Axios 封装、示例页面和最佳实践组件，开箱即可开发。

你希望我直接帮你生成吗？


#### You:
<time datetime="2026-01-03T09:13:45.948Z" title="2026/1/3 17:13:45">17:13</time>

再加一个用yarn.重新梳理

#### ChatGPT:
<time datetime="2026-01-03T09:13:53.790Z" title="2026/1/3 17:13:53">17:13</time>

好的，我们把上面的企业级 Vue3 + Vite + TypeScript + TDesign 项目搭建流程，改成使用 **Yarn** 来管理依赖，同时保持企业级最佳实践。下面是详细步骤：

---

## **1. 环境准备**

- Node.js：>=18
- Yarn：>=3

验证：

```bash
node -v
yarn -v
```

如果没有 Yarn，可以安装：

```bash
npm install -g yarn
```

---

## **2. 创建项目**

使用 Vite 创建 Vue 3 + TypeScript 项目：

```bash
yarn create vite my-enterprise-app
```

选择：

- 框架：`vue`
- 语言：`typescript`

进入项目并安装依赖：

```bash
cd my-enterprise-app
yarn
```

---

## **3. 安装 TDesign 与依赖**

安装 TDesign Vue 3 版本及图标库：

```bash
yarn add tdesign-vue-next tdesign-icons-vue-next
```

可选：安装样式预处理器（SCSS/SASS）：

```bash
yarn add -D sass
```

---

## **4. 配置全局样式和 TDesign**

在 `src/main.ts` 中引入 TDesign：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(TDesign)

app.mount('#app')
```

---

## **5. 推荐项目目录结构（企业级）**

```
my-enterprise-app/
├─ public/               # 公共静态资源
├─ src/
│  ├─ api/               # 后端接口封装
│  ├─ assets/            # 图片、字体等资源
│  ├─ components/        # 公共组件
│  │   └─ base/          # 基础组件（Button/Input）
│  │   └─ business/      # 业务组件
│  ├─ composables/       # Vue3 hooks
│  ├─ layouts/           # 页面布局组件
│  ├─ router/            # 路由配置
│  ├─ store/             # Pinia 状态管理
│  ├─ styles/            # 全局样式
│  ├─ utils/             # 工具函数
│  ├─ views/             # 页面视图
│  ├─ App.vue
│  └─ main.ts
├─ .eslintrc.js          # ESLint
├─ .prettierrc           # Prettier
├─ tsconfig.json
├─ vite.config.ts
└─ package.json
```

---

## **6. 路由配置（Vue Router 4）**

安装：

```bash
yarn add vue-router@4
```

`src/router/index.ts`：

```ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

企业级建议：

- 路由懒加载
- meta 字段保存权限、标题等信息

---

## **7. 状态管理（Pinia）**

安装：

```bash
yarn add pinia
```

`src/store/index.ts`：

```ts
import { createPinia } from 'pinia'
export default createPinia()
```

示例 store：`src/store/user.ts`：

```ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({ token: '', name: '' }),
  actions: {
    setToken(token: string) { this.token = token },
    setName(name: string) { this.name = name }
  }
})
```

---

## **8. 接口封装（Axios）**

安装 Axios：

```bash
yarn add axios
```

`src/api/http.ts`：

```ts
import axios from 'axios'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

service.interceptors.request.use(config => config)
service.interceptors.response.use(response => response.data, error => Promise.reject(error))

export default service
```

示例接口：`src/api/user.ts`：

```ts
import request from './http'

export const login = (params: { username: string; password: string }) =>
  request.post('/login', params)
```

---

## **9. TDesign 使用规范**

1. **基础组件封装**
   - `components/base/` 封装 Button、Input、Select 等
2. **业务组件**
   - `components/business/` 放业务组件
3. **样式**
   - `styles/variables.scss` 定义全局变量
   - `styles/mixins.scss` 定义全局 mixins

---

## **10. Vite 配置优化**

`vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true, rewrite: path => path.replace(/^\/api/, '') }
    }
  }
})
```

---

## **11. 企业级开发最佳实践**

1. **TypeScript 全面使用**
2. **ESLint + Prettier 规范化**
3. **组件命名 PascalCase + Base 前缀**
4. **布局与页面解耦，使用 TLayout 系列组件**
5. **路由懒加载 + 按需加载**
6. **环境变量区分**：`.env`, `.env.development`, `.env.production`
7. **国际化**：`vue-i18n` 可选

---

## **12. 启动项目**

```bash
yarn dev
# 打包
yarn build
```

浏览器访问：`http://localhost:5173`

---

如果你希望，我可以帮你**生成一个完整的企业级模板项目**，里面已经集成了：

- TDesign 布局组件
- 路由 + 页面
- Pinia 状态管理
- Axios 封装
- SCSS 全局变量与 mixins
- 示例业务组件

这样直接开箱就能开发。

你希望我帮你生成吗？


#### You:
<time datetime="2026-01-03T09:19:41.101Z" title="2026/1/3 17:19:41">17:19</time>

## 1、安装 tdesign-starter-cli
npm i tdesign-starter-cli@latest -g

## 2、创建项目
td-starter init
类似于这个，知道不

#### ChatGPT:
<time datetime="2026-01-03T09:19:48.167Z" title="2026/1/3 17:19:48">17:19</time>

知道，你说的这个就是 **TDesign 官方提供的项目脚手架** —— `tdesign-starter-cli`。\
它的作用就是帮你快速生成一个 **Vue3 + Vite + TypeScript + TDesign** 的项目模板，开箱即用，官方推荐做企业级项目的起点。

流程类似你写的：

---

## **1️⃣ 安装 CLI**

```bash
npm i -g tdesign-starter-cli@latest
```

或者用 Yarn：

```bash
yarn global add tdesign-starter-cli@latest
```

---

## **2️⃣ 创建项目**

```bash
td-starter init
```

执行后会有交互式选择：

1. 项目名称
2. 语言：`TypeScript` 或 `JavaScript`
3. UI 组件库：`TDesign`
4. 模板类型：企业级模板 / 基础模板

CLI 会帮你生成目录结构、路由、状态管理（Pinia）、Axios 封装、基础布局组件等等。

---

## **3️⃣ 安装依赖**

进入项目目录：

```bash
cd your-project-name
npm install
# 或者用 yarn
yarn
```

---

## **4️⃣ 启动项目**

```bash
npm run dev
# 或 yarn
yarn dev
```

浏览器访问：`http://localhost:5173`

---

✅ **特点**：

- 路由、状态管理、Axios、布局都预设好了
- TDesign 按需引入
- TypeScript 支持完整
- 可直接扩展企业级业务模块

---

如果你愿意，我可以帮你整理一个 **使用 tdesign-starter-cli 生成的企业级模板目录 + 样例页面说明**，这样你可以直接在这个基础上开发。

你希望我整理吗？


#### You:
<time datetime="2026-01-03T09:20:12.310Z" title="2026/1/3 17:20:12">17:20</time>

对请用我说的技术栈实现

#### ChatGPT:
<time datetime="2026-01-03T09:20:19.281Z" title="2026/1/3 17:20:19">17:20</time>

明白了，你想要一个**使用 Vue3 + Vite + TypeScript + TDesign（通过 tdesign-starter-cli）+ Yarn**的企业级模板项目，并且我帮你梳理出目录结构、配置和示例页面。下面我给你整理一份完整方案。

---

# **企业级 Vue3 + TDesign + Vite + TS + Yarn 项目模板**

## **1️⃣ 创建项目（官方 CLI）**

```bash
# 安装 CLI
yarn global add tdesign-starter-cli@latest

# 创建项目
td-starter init
```

CLI 会交互式选择：

- 项目名称：`my-enterprise-app`
- 语言：`TypeScript`
- 模板类型：企业级模板
- UI：TDesign

---

## **2️⃣ 安装依赖**

```bash
cd my-enterprise-app
yarn
```

---

## **3️⃣ 项目目录结构（企业级最佳实践）**

```
my-enterprise-app/
├─ public/                 # 静态资源
├─ src/
│  ├─ api/                 # 接口封装（Axios）
│  │   ├─ http.ts
│  │   └─ user.ts
│  ├─ assets/              # 图片、字体等资源
│  ├─ components/          # 公共组件
│  │   ├─ base/            # 基础组件：BaseButton, BaseInput
│  │   └─ business/        # 业务组件
│  ├─ composables/         # Vue3 composition API hooks
│  ├─ layouts/             # 页面布局
│  │   ├─ DefaultLayout.vue
│  │   └─ BlankLayout.vue
│  ├─ router/              # Vue Router 配置
│  │   └─ index.ts
│  ├─ store/               # Pinia 状态管理
│  │   └─ index.ts
│  ├─ styles/              # 全局样式
│  │   ├─ variables.scss
│  │   └─ mixins.scss
│  ├─ utils/               # 工具函数
│  ├─ views/               # 页面视图
│  │   ├─ Home.vue
│  │   └─ About.vue
│  ├─ App.vue
│  └─ main.ts
├─ .eslintrc.js
├─ .prettierrc
├─ tsconfig.json
├─ vite.config.ts
└─ package.json
```

---

## **4️⃣ main.ts 配置**

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(TDesign)

app.mount('#app')
```

---

## **5️⃣ 路由配置示例**

`src/router/index.ts`：

```ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

- 企业级建议：
  - 使用路由懒加载
  - meta 保存页面权限、标题等信息

---

## **6️⃣ 状态管理（Pinia）**

```bash
yarn add pinia
```

`src/store/index.ts`：

```ts
import { createPinia } from 'pinia'
export default createPinia()
```

示例 store：`src/store/user.ts`：

```ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({ token: '', name: '' }),
  actions: {
    setToken(token: string) { this.token = token },
    setName(name: string) { this.name = name }
  }
})
```

---

## **7️⃣ Axios 封装示例**

```bash
yarn add axios
```

`src/api/http.ts`：

```ts
import axios from 'axios'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

service.interceptors.request.use(config => config)
service.interceptors.response.use(res => res.data, err => Promise.reject(err))

export default service
```

`src/api/user.ts`：

```ts
import request from './http'

export const login = (params: { username: string; password: string }) =>
  request.post('/login', params)
```

---

## **8️⃣ TDesign 使用规范**

1. **基础组件封装**
   - `components/base/` 封装 Button、Input、Select
   - 避免全局直接使用 TDesign 组件
2. **业务组件**
   - `components/business/` 放业务组件
3. **样式**
   - `styles/variables.scss` 全局变量
   - `styles/mixins.scss` mixins

---

## **9️⃣ Vite 配置**

`vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true, rewrite: path => path.replace(/^\/api/, '') }
    }
  }
})
```

---

## **🔟 启动项目**

```bash
yarn dev
# 打包
yarn build
```

浏览器访问：`http://localhost:5173`

---

✅ **特点**：

- Vue3 + TS + Vite + Pinia + TDesign
- 企业级目录结构
- 路由、状态管理、Axios 封装
- SCSS 全局变量与 mixins
- CLI 可快速生成模板，直接开发

---

我可以帮你进一步**生成一个开箱即用的完整企业级模板项目目录+示例组件+示例页面**，这样你用 Yarn 执行 `yarn dev` 就能直接开发。

你希望我直接帮你生成这个模板吗？
