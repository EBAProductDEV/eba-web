<template>
  <t-form ref="form" class="item-container" :data="formData" :rules="rules" label-width="0" @submit="onSubmit">
    <t-form-item name="userName">
      <t-input v-model="formData.userName" size="large" placeholder="请输入用户名">
        <template #prefix-icon>
          <t-icon name="user" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="trueName">
      <t-input v-model="formData.trueName" size="large" placeholder="请输入姓名">
        <template #prefix-icon>
          <t-icon name="assignment-user" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="mobile">
      <t-input v-model="formData.mobile" size="large" placeholder="请输入手机号">
        <template #prefix-icon>
          <t-icon name="mobile" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="email">
      <t-input v-model="formData.email" size="large" placeholder="请输入邮箱（可选）">
        <template #prefix-icon>
          <t-icon name="mail" />
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

    <t-form-item name="confirmPassword">
      <t-input
        v-model="formData.confirmPassword"
        size="large"
        :type="showConfirmPassword ? 'text' : 'password'"
        clearable
        placeholder="请再次输入密码"
      >
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>
        <template #suffix-icon>
          <t-icon
            :name="showConfirmPassword ? 'browse' : 'browse-off'"
            @click="showConfirmPassword = !showConfirmPassword"
          />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item class="btn-container">
      <t-button block size="large" type="submit" :loading="submitting">注册</t-button>
    </t-form-item>
  </t-form>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';

import { useUserStore } from '@/store';

const emit = defineEmits<{
  (e: 'register-success'): void;
}>();

const form = ref<FormInstanceFunctions>();
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const submitting = ref(false);
const userStore = useUserStore();

// 注册表单字段直接对应后端 RegisterRequest。
const formData = ref({
  userName: '',
  trueName: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const rules: Record<string, FormRule[]> = {
  userName: [{ required: true, message: '用户名不能为空', type: 'error' }],
  trueName: [{ required: true, message: '姓名不能为空', type: 'error' }],
  mobile: [{ required: true, message: '手机号不能为空', type: 'error' }],
  email: [{ email: true, message: '请输入正确的邮箱', type: 'warning' }],
  password: [{ required: true, message: '密码不能为空', type: 'error' }],
  confirmPassword: [{ required: true, message: '确认密码不能为空', type: 'error' }],
};

// 注册成功后不自动登录，而是切回登录页，让用户走标准登录流程。
const onSubmit = async (context: SubmitContext) => {
  if (context.validateResult !== true || submitting.value) {
    return;
  }
  if (formData.value.password !== formData.value.confirmPassword) {
    MessagePlugin.error('两次输入的密码不一致');
    return;
  }

  submitting.value = true;
  try {
    await userStore.register({
      ...formData.value,
      email: formData.value.email || undefined,
    });
    MessagePlugin.success('注册成功，请登录');
    form.value?.reset();
    emit('register-success');
  } catch (error: any) {
    MessagePlugin.error(error?.message || '注册失败');
  } finally {
    submitting.value = false;
  }
};
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
