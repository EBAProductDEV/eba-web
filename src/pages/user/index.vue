<template>
  <t-row :gutter="[24, 24]">
    <t-col :span="8">
      <t-card title="账号信息" :bordered="false">
        <div class="user-profile">
          <t-avatar size="72px">{{ avatarText }}</t-avatar>
          <div class="user-profile__text">
            <div class="user-profile__name">{{ userInfo.name || userInfo.userName }}</div>
            <div class="user-profile__sub">{{ userInfo.roleCode || 'USER' }}</div>
          </div>
        </div>

        <t-descriptions class="user-descriptions" :column="2" item-layout="vertical">
          <t-descriptions-item label="用户名">{{ userInfo.userName || '-' }}</t-descriptions-item>
          <t-descriptions-item label="姓名">{{ userInfo.trueName || '-' }}</t-descriptions-item>
          <t-descriptions-item label="手机号">{{ userInfo.mobile || '-' }}</t-descriptions-item>
          <t-descriptions-item label="邮箱">{{ userInfo.email || '-' }}</t-descriptions-item>
          <t-descriptions-item label="角色">{{ userInfo.roleCode || '-' }}</t-descriptions-item>
          <t-descriptions-item label="状态">{{ userInfo.status === '1' ? '启用' : '禁用' }}</t-descriptions-item>
          <t-descriptions-item label="最后登录">{{ formatDate(userInfo.loginTime) }}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{ formatDate(userInfo.createTime) }}</t-descriptions-item>
        </t-descriptions>
      </t-card>
    </t-col>

    <t-col :span="4">
      <t-card title="补充资料" :bordered="false">
        <t-descriptions :column="1" item-layout="vertical">
          <t-descriptions-item label="性别">{{ userInfo.gender || '-' }}</t-descriptions-item>
          <t-descriptions-item label="出生年月">{{ userInfo.birth || '-' }}</t-descriptions-item>
          <t-descriptions-item label="联系电话">{{ userInfo.tel || '-' }}</t-descriptions-item>
          <t-descriptions-item label="通讯地址">{{ userInfo.addr || '-' }}</t-descriptions-item>
          <t-descriptions-item label="邮编">{{ userInfo.postCode || '-' }}</t-descriptions-item>
          <t-descriptions-item label="证件类型">{{ userInfo.identityType || '-' }}</t-descriptions-item>
          <t-descriptions-item label="证件号码">{{ userInfo.identityNum || '-' }}</t-descriptions-item>
          <t-descriptions-item label="备注">{{ userInfo.remark || '-' }}</t-descriptions-item>
        </t-descriptions>
      </t-card>
    </t-col>
  </t-row>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';

import { useUserStore } from '@/store';

defineOptions({
  name: 'UserIndex',
});

const userStore = useUserStore();
// 个人中心直接复用 store 中的当前用户资料，不再依赖模板假数据。
const userInfo = computed(() => userStore.userInfo);
// 头像没有图片时，用姓名或用户名首字母兜底显示。
const avatarText = computed(() => (userInfo.value.name || userInfo.value.userName || 'U').slice(0, 1).toUpperCase());

const formatDate = (value?: string) => {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';
};
</script>
<style lang="less" scoped>
@import './index.less';

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile__name {
  font-size: 20px;
  font-weight: 600;
}

.user-profile__sub {
  margin-top: 4px;
  color: var(--td-text-color-secondary);
}

.user-descriptions {
  margin-top: 24px;
}
</style>
