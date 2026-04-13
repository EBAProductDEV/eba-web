<template>
  <div class="system-user-page">
    <t-card title="用户管理" :bordered="false">
      <div class="toolbar">
        <div class="toolbar__meta">
          <div class="toolbar__title">用户列表</div>
          <div class="toolbar__desc">共 {{ total }} 条记录，当前第 {{ query.pageNum }} / {{ totalPages }} 页</div>
        </div>
        <t-space>
          <t-button variant="outline" @click="loadData">刷新</t-button>
          <t-button theme="primary" @click="openCreateDialog">新增用户</t-button>
        </t-space>
      </div>

      <t-form class="search-form" layout="inline">
        <t-form-item label="用户名">
          <t-input v-model="query.userName" clearable placeholder="按用户名查询" @enter="handleSearch" />
        </t-form-item>
        <t-form-item label="姓名">
          <t-input v-model="query.trueName" clearable placeholder="按姓名查询" @enter="handleSearch" />
        </t-form-item>
        <t-form-item label="手机号">
          <t-input v-model="query.mobile" clearable placeholder="按手机号查询" @enter="handleSearch" />
        </t-form-item>
        <t-form-item label="角色">
          <t-select v-model="query.roleCode" clearable placeholder="全部角色" style="width: 140px">
            <t-option v-for="item in roleOptions" :key="item.value" :value="item.value" :label="item.label" />
          </t-select>
        </t-form-item>
        <t-form-item label="状态">
          <t-select v-model="query.status" clearable placeholder="全部状态" style="width: 140px">
            <t-option v-for="item in statusOptions" :key="item.value" :value="item.value" :label="item.label" />
          </t-select>
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" @click="handleSearch">查询</t-button>
            <t-button variant="outline" @click="handleReset">重置</t-button>
          </t-space>
        </t-form-item>
      </t-form>

      <t-table
        row-key="id"
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        stripe
        hover
        table-layout="fixed"
        @page-change="onPageChange"
      >
        <template #roleCode="{ row }">
          <t-tag :theme="row.roleCode === 'ADMIN' ? 'primary' : 'default'" variant="light">
            {{ row.roleCode === 'ADMIN' ? '管理员' : '普通用户' }}
          </t-tag>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === '1' ? 'success' : 'danger'" variant="light">
            {{ row.status === '1' ? '启用' : '停用' }}
          </t-tag>
        </template>
        <template #loginTime="{ row }">
          {{ formatDate(row.loginTime) }}
        </template>
        <template #createTime="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link theme="primary" hover="color" @click="openEditDialog(row)">编辑</t-link>
            <t-link theme="primary" hover="color" @click="toggleStatus(row)">
              {{ row.status === '1' ? '停用' : '启用' }}
            </t-link>
            <t-link theme="warning" hover="color" @click="openResetPasswordDialog(row)">重置密码</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      :confirm-loading="dialogLoading"
      width="680px"
      destroy-on-close
      @confirm="submitUser"
    >
      <t-form ref="dialogFormRef" :data="dialogForm" :rules="dialogRules" label-width="100px">
        <t-form-item label="用户名" name="userName">
          <t-input v-model="dialogForm.userName" clearable />
        </t-form-item>
        <t-form-item label="姓名" name="trueName">
          <t-input v-model="dialogForm.trueName" clearable />
        </t-form-item>
        <t-form-item label="手机号" name="mobile">
          <t-input v-model="dialogForm.mobile" clearable />
        </t-form-item>
        <t-form-item label="邮箱" name="email">
          <t-input v-model="dialogForm.email" clearable />
        </t-form-item>
        <t-form-item v-if="dialogMode === 'create'" label="初始密码" name="password">
          <t-input v-model="dialogForm.password" type="password" clearable />
        </t-form-item>
        <t-form-item label="角色" name="roleCode">
          <t-select v-model="dialogForm.roleCode">
            <t-option v-for="item in roleOptions" :key="item.value" :value="item.value" :label="item.label" />
          </t-select>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="dialogForm.status">
            <t-radio-button value="1">启用</t-radio-button>
            <t-radio-button value="0">停用</t-radio-button>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="dialogForm.remark" :maxlength="200" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <t-dialog
      v-model:visible="passwordDialogVisible"
      header="重置密码"
      :confirm-loading="passwordLoading"
      width="520px"
      destroy-on-close
      @confirm="submitPassword"
    >
      <t-form ref="passwordFormRef" :data="passwordForm" :rules="passwordRules" label-width="100px">
        <t-form-item label="新密码" name="newPassword">
          <t-input v-model="passwordForm.newPassword" type="password" clearable />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import type { FormInstanceFunctions, FormRule, PageInfo, PaginationProps, PrimaryTableCol } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';

import type { SaveUserParams, UserListItem, UserListQuery } from '@/api/model/userAdminModel';
import { createUser, getUserPage, resetUserPassword, updateUser, updateUserStatus } from '@/api/user-admin';

defineOptions({
  name: 'SystemUserPage',
});

// 页面上的固定选项统一收口，便于后续改成字典接口时集中替换。
const roleOptions = [
  { label: '普通用户', value: 'USER' },
  { label: '管理员', value: 'ADMIN' },
];

const statusOptions = [
  { label: '启用', value: '1' },
  { label: '停用', value: '0' },
];

const loading = ref(false);
const dialogVisible = ref(false);
const passwordDialogVisible = ref(false);
const dialogLoading = ref(false);
const passwordLoading = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const passwordUserId = ref<number | null>(null);
const tableData = ref<UserListItem[]>([]);
const total = ref(0);

const dialogFormRef = ref<FormInstanceFunctions>();
const passwordFormRef = ref<FormInstanceFunctions>();

// 查询条件与后端分页接口一一对应，切页和搜索都基于这一个对象驱动。
const createEmptyQuery = (): UserListQuery => ({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  trueName: '',
  mobile: '',
  roleCode: '',
  status: '',
});

const query = reactive<UserListQuery>(createEmptyQuery());

// 新增和编辑用户共用一套表单，只在 dialogMode 上区分当前操作类型。
const createEmptyForm = (): SaveUserParams => ({
  userName: '',
  trueName: '',
  mobile: '',
  email: '',
  password: '',
  status: '1',
  roleCode: 'USER',
  remark: '',
});

const dialogForm = reactive<SaveUserParams>(createEmptyForm());
const passwordForm = reactive({
  newPassword: '',
});

const dialogRules: Record<string, FormRule[]> = {
  userName: [{ required: true, message: '请输入用户名', type: 'error' }],
  trueName: [{ required: true, message: '请输入姓名', type: 'error' }],
  mobile: [{ required: true, message: '请输入手机号', type: 'error' }],
  email: [{ email: true, message: '请输入正确的邮箱地址', type: 'warning' }],
  password: [
    { required: true, message: '请输入初始密码', type: 'error' },
    { min: 6, message: '密码长度不能少于 6 位', type: 'warning' },
  ],
  roleCode: [{ required: true, message: '请选择角色', type: 'error' }],
  status: [{ required: true, message: '请选择状态', type: 'error' }],
};

const passwordRules: Record<string, FormRule[]> = {
  newPassword: [
    { required: true, message: '请输入新密码', type: 'error' },
    { min: 6, message: '密码长度不能少于 6 位', type: 'warning' },
  ],
};

const columns = computed<PrimaryTableCol[]>(() => [
  { colKey: 'userName', title: '用户名', minWidth: 160, ellipsis: true },
  { colKey: 'trueName', title: '姓名', minWidth: 140, ellipsis: true },
  { colKey: 'mobile', title: '手机号', minWidth: 160, ellipsis: true },
  { colKey: 'email', title: '邮箱', minWidth: 220, ellipsis: true },
  { colKey: 'roleCode', title: '角色', width: 120, align: 'center' },
  { colKey: 'status', title: '状态', width: 120, align: 'center' },
  { colKey: 'loginTime', title: '最后登录时间', minWidth: 180 },
  { colKey: 'createTime', title: '创建时间', minWidth: 180 },
  { colKey: 'op', title: '操作', width: 220, fixed: 'right', align: 'center' },
]);

const pagination = computed<PaginationProps>(() => ({
  // t-table 的分页配置直接取后端返回的总数和当前查询参数，实现真正的服务端分页。
  current: query.pageNum,
  pageSize: query.pageSize,
  total: total.value,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100],
}));

const totalPages = computed(() => {
  if (!total.value) {
    return 1;
  }
  return Math.ceil(total.value / query.pageSize);
});

const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增用户' : '编辑用户'));

const formatDate = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-');

const loadData = async () => {
  loading.value = true;
  try {
    // 所有列表刷新入口最终都收敛到这里，保证搜索、重置、翻页逻辑一致。
    const result = await getUserPage({ ...query });
    tableData.value = result.list || [];
    total.value = result.total || 0;
  } catch (error: any) {
    MessagePlugin.error(error?.message || '加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  query.pageNum = 1;
  await loadData();
};

const handleReset = async () => {
  Object.assign(query, createEmptyQuery());
  await loadData();
};

const onPageChange = async (pageInfo: PageInfo) => {
  // t-table 页码变化后只更新查询参数，再重新请求后端分页接口。
  query.pageNum = pageInfo.current;
  query.pageSize = pageInfo.pageSize;
  await loadData();
};

const assignDialogForm = (payload: Partial<SaveUserParams>) => {
  Object.assign(dialogForm, createEmptyForm(), payload);
};

const openCreateDialog = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  assignDialogForm({});
  dialogVisible.value = true;
};

const openEditDialog = (row: UserListItem) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  assignDialogForm({
    userName: row.userName,
    trueName: row.trueName,
    mobile: row.mobile || '',
    email: row.email || '',
    status: row.status,
    roleCode: row.roleCode,
  });
  dialogVisible.value = true;
};

const submitUser = async () => {
  const valid = await dialogFormRef.value?.validate();
  if (valid !== true) {
    return;
  }

  dialogLoading.value = true;
  try {
    // 编辑时不提交 password，避免把空密码误覆盖到后端。
    const payload: SaveUserParams = {
      ...dialogForm,
      email: dialogForm.email || undefined,
      password: dialogMode.value === 'create' ? dialogForm.password : undefined,
    };

    if (dialogMode.value === 'create') {
      await createUser(payload);
      MessagePlugin.success('新增用户成功');
    } else if (editingId.value) {
      await updateUser(editingId.value, payload);
      MessagePlugin.success('编辑用户成功');
    }

    dialogVisible.value = false;
    await loadData();
  } catch (error: any) {
    MessagePlugin.error(error?.message || '提交失败');
  } finally {
    dialogLoading.value = false;
  }
};

const toggleStatus = async (row: UserListItem) => {
  try {
    // 状态切换只传目标状态值，让后端负责真正的启停与会话失效处理。
    await updateUserStatus(row.id, { status: row.status === '1' ? '0' : '1' });
    MessagePlugin.success(row.status === '1' ? '已停用该用户' : '已启用该用户');
    await loadData();
  } catch (error: any) {
    MessagePlugin.error(error?.message || '状态更新失败');
  }
};

const openResetPasswordDialog = (row: UserListItem) => {
  passwordUserId.value = row.id;
  passwordForm.newPassword = '';
  passwordDialogVisible.value = true;
};

const submitPassword = async () => {
  const valid = await passwordFormRef.value?.validate();
  if (valid !== true || !passwordUserId.value) {
    return;
  }

  passwordLoading.value = true;
  try {
    await resetUserPassword(passwordUserId.value, { newPassword: passwordForm.newPassword });
    MessagePlugin.success('密码重置成功');
    passwordDialogVisible.value = false;
  } catch (error: any) {
    MessagePlugin.error(error?.message || '密码重置失败');
  } finally {
    passwordLoading.value = false;
  }
};

onMounted(() => {
  // 首次进入页面时自动加载第一页数据。
  loadData();
});
</script>
<style lang="less" scoped>
.system-user-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  &__desc {
    font-size: 12px;
    color: var(--td-text-color-secondary);
  }
}

.search-form {
  margin-bottom: 16px;
}
</style>
