<template>
  <div class="drama-page">
    <div class="drama-header">
      <div>
        <h1>我的项目</h1>
        <p>管理您的所有短剧项目</p>
      </div>
      <t-button theme="primary" size="large" class="create-button" @click="openCreateDialog"> + 新建项目 </t-button>
    </div>

    <t-loading :loading="loading" text="加载短剧项目中...">
      <div v-if="seriesList.length" class="project-grid">
        <article v-for="item in seriesList" :key="item.id" class="project-card" @click="goDetail(item.id)">
          <button class="delete-button" title="删除项目" @click.stop="confirmDelete(item)">×</button>
          <div class="folder-icon">
            <folder-icon />
          </div>
          <h3>{{ item.name }}</h3>
          <div class="meta-row">
            <span>{{ item.type }}</span>
            <span>{{ item.totalEpisodes }}集</span>
            <span>{{ item.episodeDurationMinutes }}分钟/集</span>
          </div>
          <p class="intro">{{ item.intro || '暂无简介，点击进入项目详情补充世界观、角色和镜头设定。' }}</p>
          <div class="card-footer">
            <span>风格：{{ item.style || '未设置' }}</span>
            <span>{{ formatDate(item.createdAt) }}</span>
          </div>
        </article>
      </div>

      <t-empty v-else class="empty" description="还没有短剧项目，先新建一个项目开始创作。">
        <template #action>
          <t-button theme="primary" @click="openCreateDialog">新建项目</t-button>
        </template>
      </t-empty>
    </t-loading>

    <t-dialog
      v-model:visible="createVisible"
      header="新建短剧项目"
      width="640px"
      :confirm-loading="submitting"
      @confirm="submitCreate"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="110px">
        <t-form-item label="项目名称" name="name">
          <t-input v-model="form.name" placeholder="例如：逆袭保洁阿姨" />
        </t-form-item>
        <t-form-item label="类型" name="type">
          <t-select v-model="form.type" placeholder="选择短剧类型">
            <t-option value="都市逆袭" label="都市逆袭" />
            <t-option value="甜宠" label="甜宠" />
            <t-option value="悬疑" label="悬疑" />
            <t-option value="古装" label="古装" />
            <t-option value="家庭伦理" label="家庭伦理" />
          </t-select>
        </t-form-item>
        <t-form-item label="简介" name="intro">
          <t-textarea
            v-model="form.intro"
            placeholder="一句话讲清主角、冲突和爽点"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </t-form-item>
        <t-form-item label="总集数" name="totalEpisodes">
          <t-input-number v-model="form.totalEpisodes" :min="1" :max="500" />
        </t-form-item>
        <t-form-item label="单集时长" name="episodeDurationMinutes">
          <t-input-number v-model="form.episodeDurationMinutes" :min="1" :max="180" suffix="分钟" />
        </t-form-item>
        <t-form-item label="风格" name="style">
          <t-input v-model="form.style" placeholder="例如：强反转、快节奏、竖屏、电影感" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { FolderIcon } from 'tdesign-icons-vue-next';
import type { FormRules } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { createDramaSeries, deleteDramaSeries, listDramaSeries } from '@/api/modules/ai/drama';
import type { DramaSeriesCreateRequest, DramaSeriesSummary } from '@/types/modules/ai/drama';

const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const createVisible = ref(false);
const seriesList = ref<DramaSeriesSummary[]>([]);
const formRef = ref();

const form = reactive<DramaSeriesCreateRequest>({
  name: '',
  type: '',
  intro: '',
  theme: '',
  style: '',
  totalEpisodes: 12,
  episodeDurationMinutes: 2,
});

const rules: FormRules<DramaSeriesCreateRequest> = {
  name: [{ required: true, message: '请输入项目名称', type: 'error' }],
  type: [{ required: true, message: '请选择类型', type: 'error' }],
  totalEpisodes: [{ required: true, message: '请输入总集数', type: 'error' }],
  episodeDurationMinutes: [{ required: true, message: '请输入单集时长', type: 'error' }],
};

function resetForm() {
  form.name = '';
  form.type = '';
  form.intro = '';
  form.theme = '';
  form.style = '';
  form.totalEpisodes = 12;
  form.episodeDurationMinutes = 2;
}

function formatDate(value: string) {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 16);
}

async function loadSeries() {
  loading.value = true;
  try {
    seriesList.value = await listDramaSeries();
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  resetForm();
  createVisible.value = true;
}

async function submitCreate() {
  const result = await formRef.value?.validate?.();
  if (result !== true) return;
  submitting.value = true;
  try {
    const created = await createDramaSeries({ ...form });
    MessagePlugin.success('短剧项目已创建');
    createVisible.value = false;
    await loadSeries();
    await router.push(`/ai/drama/projects/${created.id}`);
  } finally {
    submitting.value = false;
  }
}

async function confirmDelete(item: DramaSeriesSummary) {
  const dialog = DialogPlugin.confirm({
    header: '确认删除项目',
    body: `确定删除短剧项目「${item.name}」吗？删除后列表中将不可见。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      await deleteDramaSeries(item.id);
      MessagePlugin.success('项目已删除');
      await loadSeries();
      dialog.hide();
    },
  });
}

function goDetail(id: number) {
  router.push(`/ai/drama/projects/${id}`);
}

onMounted(loadSeries);
</script>
<style scoped lang="less">
.drama-page {
  min-height: calc(100vh - 96px);
  padding: 34px;
  background: #f5f6fb;
}

.drama-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;

  h1 {
    margin: 0;
    color: #202235;
    font-size: 34px;
    font-weight: 760;
    letter-spacing: -0.5px;
  }

  p {
    margin: 10px 0 0;
    color: #81879a;
    font-size: 15px;
  }
}

.create-button {
  height: 42px;
  padding: 0 20px;
  border-radius: 12px;
  background: #725cff;
  border-color: #725cff;
  box-shadow: 0 12px 24px rgb(114 92 255 / 24%);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 22px;
}

.project-card {
  position: relative;
  min-height: 230px;
  padding: 26px;
  background: #fff;
  border: 1px solid rgb(133 139 160 / 12%);
  border-radius: 22px;
  box-shadow: 0 18px 42px rgb(34 38 64 / 6%);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 56px rgb(34 38 64 / 10%);
  }

  h3 {
    margin: 18px 0 10px;
    color: #22243a;
    font-size: 20px;
    font-weight: 720;
  }
}

.delete-button {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 28px;
  height: 28px;
  color: #e05a5a;
  font-size: 22px;
  line-height: 22px;
  background: #fff2f2;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.folder-icon {
  display: grid;
  width: 54px;
  height: 54px;
  color: #765dff;
  background: #f0edff;
  border-radius: 16px;
  place-items: center;

  :deep(svg) {
    width: 28px;
    height: 28px;
  }
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    padding: 4px 9px;
    color: #6757d8;
    font-size: 12px;
    background: #f3f0ff;
    border-radius: 999px;
  }
}

.intro {
  min-height: 44px;
  margin: 14px 0 22px;
  color: #697084;
  font-size: 14px;
  line-height: 1.6;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  color: #9aa0b1;
  font-size: 12px;
}

.empty {
  margin-top: 90px;
  padding: 60px 0;
  background: #fff;
  border-radius: 24px;
}

@media (width <= 768px) {
  .drama-page {
    padding: 22px;
  }

  .drama-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
