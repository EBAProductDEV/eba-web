<template>
  <t-form ref="form" class="item-container" :data="formData" :rules="rules" label-width="0" @submit="onSubmit">
    <t-form-item name="userName">
      <t-input v-model="formData.userName" size="large" placeholder="请输入用户名">
        <template #prefix-icon>
          <t-icon name="user" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="password">
      <t-input
        v-model="formData.password"
        size="large"
        :type="showPassword ? 'text' : 'password'"
        clearable
        placeholder="请输入密码"
      >
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>
        <template #suffix-icon>
          <t-icon :name="showPassword ? 'browse' : 'browse-off'" @click="showPassword = !showPassword" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item class="btn-container">
      <t-button block size="large" type="submit" :loading="submitting">登录</t-button>
    </t-form-item>

    <div class="switch-container">
      <span class="tip" @click="$emit('switch-register')">没有账号？去注册</span>
    </div>
  </t-form>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useUserStore } from '@/store';

defineEmits<{
  (e: 'switch-register'): void;
}>();

const form = ref<FormInstanceFunctions>();
const showPassword = ref(false);
const submitting = ref(false);
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 登录表单与后端登录接口字段保持一致，避免页面层再做额外映射。
const formData = ref({
  userName: '',
  password: '',
});

const rules: Record<string, FormRule[]> = {
  userName: [{ required: true, message: '用户名不能为空', type: 'error' }],
  password: [{ required: true, message: '密码不能为空', type: 'error' }],
};

// 登录成功后优先回跳到原目标页，没有 redirect 时再进入默认首页。
const onSubmit = async (context: SubmitContext) => {
  if (context.validateResult !== true || submitting.value) {
    return;
  }
  submitting.value = true;
  try {
    await userStore.login(formData.value);
    MessagePlugin.success('登录成功');
    const redirect = route.query.redirect as string;
    const redirectUrl = redirect ? decodeURIComponent(redirect) : '/dashboard/base';
    await router.push(redirectUrl);
  } catch (error: any) {
    MessagePlugin.error(error?.message || '登录失败');
  } finally {
    submitting.value = false;
  }
};
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
