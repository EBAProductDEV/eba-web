<template>
  <div class="login-wrapper">
    <login-header />

    <div class="login-container">
      <div class="title-container">
        <h1 class="title margin-no">QCTV1 IAM</h1>
        <h1 class="title">{{ type === 'login' ? '账号登录' : '注册账号' }}</h1>
        <div class="sub-title">
          <p class="tip">{{ type === 'login' ? '还没有账号？' : '已经有账号？' }}</p>
          <p class="tip" @click="switchType(type === 'login' ? 'register' : 'login')">
            {{ type === 'login' ? '立即注册' : '返回登录' }}
          </p>
        </div>
      </div>

      <login-form v-if="type === 'login'" @switch-register="switchType('register')" />
      <register-form v-else @register-success="switchType('login')" />
      <tdesign-setting />
    </div>

    <footer class="copyright">Copyright @ 2021-2026 QCTV1. All Rights Reserved</footer>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import TdesignSetting from '@/layouts/setting.vue';

import LoginHeader from './components/Header.vue';
import LoginForm from './components/Login.vue';
import RegisterForm from './components/Register.vue';

defineOptions({
  name: 'LoginIndex',
});

// 登录页与注册页共用同一个壳子，通过 type 控制当前展示哪个表单。
const type = ref<'login' | 'register'>('login');

const switchType = (value: 'login' | 'register') => {
  type.value = value;
};
</script>
<style lang="less" scoped>
@import './index.less';
</style>
