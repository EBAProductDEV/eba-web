<template>
  <div class="story-page">
    <button class="back-button" @click="router.push(`/ai/drama/projects/${projectId}`)">← 返回项目详情</button>

    <t-loading :loading="loading" text="加载故事总纲中...">
      <template v-if="detail">
        <section class="story-hero">
          <div>
            <span class="badge">第一步</span>
            <h1>编辑故事总纲</h1>
            <p>{{ detail.name }} · 先确定整部短剧的故事原文、故事摘要和故事总纲，再进入分集大纲。</p>
          </div>
          <div class="hero-actions">
            <t-button class="hero-action-button" variant="outline" :loading="generating" @click="handleGenerateAll">
              AI 生成全部
            </t-button>
            <t-button class="hero-action-button" theme="primary" :loading="saving" @click="handleSave">
              保存全部
            </t-button>
          </div>
        </section>

        <section class="editor-card original-card">
          <div class="card-title with-actions">
            <div>
              <h2>故事原文</h2>
              <span
                >放原始故事、用户口述、小说片段、参考剧情或完整创意素材；后续 AI
                会基于这里提炼故事摘要和完整故事总纲</span
              >
            </div>
            <div class="card-actions">
              <t-button class="card-action-button" size="small" variant="outline" @click="handleAiEdit('original')">
                AI 优化
              </t-button>
              <t-button
                class="card-action-button preview-button"
                size="small"
                variant="text"
                @click="openDetail('original')"
              >
                预览详情
              </t-button>
            </div>
          </div>
          <t-textarea
            v-model="form.originalStory"
            placeholder="在这里粘贴或编写故事原文。例如：主角背景、已有小说片段、口述剧情、短剧创意、关键爽点、不能改变的人物设定等。"
            :autosize="{ minRows: 10, maxRows: 18 }"
          />
        </section>

        <section class="editor-grid">
          <article class="editor-card">
            <div class="card-title with-actions">
              <div>
                <h2>故事摘要</h2>
                <span>用于项目卡片和分集生成前的快速上下文</span>
              </div>
              <div class="card-actions">
                <t-button class="card-action-button" size="small" variant="outline" @click="handleAiEdit('summary')">
                  AI 优化
                </t-button>
                <t-button
                  class="card-action-button preview-button"
                  size="small"
                  variant="text"
                  @click="openDetail('summary')"
                >
                  预览详情
                </t-button>
              </div>
            </div>
            <t-textarea
              v-model="form.storySummary"
              placeholder="用 1 到 3 句话概括整部短剧：主角是谁、目标是什么、主要冲突是什么、最终情绪兑现是什么。"
              :autosize="{ minRows: 4, maxRows: 8 }"
            />
          </article>

          <article class="editor-card main-editor">
            <div class="card-title with-actions">
              <div>
                <h2>完整故事总纲</h2>
                <span>建议包含世界观、角色关系、三幕/四幕结构、分集方向、反转设计和禁用设定</span>
              </div>
              <div class="card-actions">
                <t-button class="card-action-button" size="small" variant="outline" @click="handleAiEdit('outline')">
                  AI 优化
                </t-button>
                <t-button
                  class="card-action-button preview-button"
                  size="small"
                  variant="text"
                  @click="openDetail('outline')"
                >
                  预览详情
                </t-button>
              </div>
            </div>
            <t-textarea
              v-model="form.fullStory"
              placeholder="在这里编写完整故事总纲。后续生成分集大纲时，会以这份内容作为基础。"
              :autosize="{ minRows: 22, maxRows: 36 }"
            />
          </article>
        </section>
      </template>
    </t-loading>

    <t-dialog
      v-model:visible="detailVisible"
      :header="detailTitle"
      width="1040px"
      placement="center"
      :footer="false"
      attach="body"
      destroy-on-close
    >
      <div class="markdown-dialog-body">
        <div class="markdown-preview" v-html="detailHtml"></div>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { generateDramaStory, getDramaSeriesDetail, saveDramaStory } from '@/api/modules/ai/drama';
import type { DramaSeriesDetail, DramaStorySaveRequest } from '@/types/modules/ai/drama';

type StoryBlock = 'original' | 'summary' | 'outline';

const route = useRoute();
const router = useRouter();
const projectId = computed(() => Number(route.params.id));

const loading = ref(false);
const saving = ref(false);
const generating = ref(false);
const detailVisible = ref(false);
const detailBlock = ref<StoryBlock>('original');
const detail = ref<DramaSeriesDetail>();

const form = reactive<DramaStorySaveRequest>({
  originalStory: '',
  storySummary: '',
  fullStory: '',
});

const blockMeta: Record<StoryBlock, { title: string; empty: string }> = {
  original: { title: '故事原文', empty: '暂无故事原文。' },
  summary: { title: '故事摘要', empty: '暂无故事摘要。' },
  outline: { title: '完整故事总纲', empty: '暂无完整故事总纲。' },
};

const detailTitle = computed(() => `${blockMeta[detailBlock.value].title}详情`);
const detailMarkdown = computed(() => {
  const content = getBlockContent(detailBlock.value).trim() || blockMeta[detailBlock.value].empty;
  return `# ${blockMeta[detailBlock.value].title}\n\n${content}`;
});
const detailHtml = computed(() => markdownToHtml(detailMarkdown.value));

function fillForm(data: DramaSeriesDetail) {
  form.originalStory = data.originalStory || '';
  form.storySummary = data.storySummary || '';
  form.fullStory = data.fullStory || '';
}

async function loadDetail() {
  loading.value = true;
  try {
    const data = await getDramaSeriesDetail(projectId.value);
    detail.value = data;
    fillForm(data);
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const data = await saveDramaStory(projectId.value, {
      originalStory: form.originalStory,
      storySummary: form.storySummary,
      fullStory: form.fullStory,
    });
    detail.value = data;
    fillForm(data);
    MessagePlugin.success('原文、摘要、故事总纲已保存');
  } finally {
    saving.value = false;
  }
}

async function handleGenerateAll() {
  generating.value = true;
  try {
    if (!form.originalStory?.trim()) {
      form.originalStory = buildOriginalStoryPlaceholder();
      await saveDramaStory(projectId.value, {
        originalStory: form.originalStory,
        storySummary: form.storySummary,
        fullStory: form.fullStory,
      });
    }
    await generateDramaStory(projectId.value);
    MessagePlugin.success('AI 已生成原文、摘要、故事总纲占位稿');
    await loadDetail();
  } finally {
    generating.value = false;
  }
}

function handleAiEdit(block: StoryBlock) {
  MessagePlugin.info(`${blockMeta[block].title}的 AI 编辑功能暂未接入真实模型，当前为占位入口`);
}

function openDetail(block: StoryBlock) {
  detailBlock.value = block;
  detailVisible.value = true;
}

function getBlockContent(block: StoryBlock) {
  if (block === 'original') return form.originalStory || '';
  if (block === 'summary') return form.storySummary || '';
  return form.fullStory || '';
}

function buildOriginalStoryPlaceholder() {
  const name = detail.value?.name || '未命名短剧';
  const type = detail.value?.type || '短剧';
  const style = detail.value?.style || '快节奏、强冲突、强反转';
  return `【故事原文占位稿】\n项目名称：${name}\n类型：${type}\n风格：${style}\n\n这里用于承载用户提供的原始故事素材。后续接入真实 AI 后，可以基于项目名称、类型、风格、角色设定和知识库资料生成更完整的故事原文。`;
}

function markdownToHtml(markdown: string) {
  const escaped = escapeHtml(markdown);
  return escaped
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replace(/<p><h([1-3])>/g, '<h$1>')
    .replace(/<\/h([1-3])><\/p>/g, '</h$1>');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

onMounted(loadDetail);
</script>
<style scoped lang="less">
.story-page {
  min-height: calc(100vh - 96px);
  padding: 30px;
  background: #f5f6fb;
}

.back-button {
  margin-bottom: 18px;
  color: #667085;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.story-hero,
.editor-card {
  background: #fff;
  border: 1px solid rgb(133 139 160 / 12%);
  border-radius: 24px;
  box-shadow: 0 18px 42px rgb(34 38 64 / 6%);
}

.story-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
  margin-bottom: 22px;

  h1 {
    margin: 12px 0;
    color: #202235;
    font-size: 32px;
  }

  p {
    max-width: 860px;
    color: #697084;
    line-height: 1.7;
  }
}

.badge {
  padding: 6px 12px;
  color: #6757d8;
  background: #f3f0ff;
  border-radius: 999px;
}

.hero-actions,
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-actions {
  align-items: center;
  justify-content: flex-end;
  padding-top: 4px;
}

.hero-action-button {
  min-width: 116px;
  font-weight: 600;
}

.card-actions {
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.card-action-button {
  min-width: 78px;
}

.preview-button {
  color: #596780;
}

.editor-grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 22px;
}

.editor-card {
  padding: 24px;
}

.original-card {
  margin-bottom: 22px;
}

.card-title {
  margin-bottom: 16px;

  h2 {
    margin: 0;
    color: #22243a;
    font-size: 20px;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #8a90a2;
    line-height: 1.6;
  }
}

.card-title.with-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22px;
}

.main-editor :deep(.t-textarea__inner),
.original-card :deep(.t-textarea__inner) {
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  line-height: 1.8;
}

.markdown-dialog-body {
  max-height: 72vh;
  overflow: auto;
  padding: 8px 10px 4px 0;
}

.markdown-preview {
  max-width: 920px;
  min-height: 420px;
  margin: 0 auto;
  color: #27314a;
  line-height: 1.85;
  overflow-wrap: anywhere;

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin: 0 0 14px;
    color: #172033;
  }

  :deep(p) {
    margin: 0 0 12px;
  }
}

@media (width <= 1100px) {
  .story-hero,
  .editor-grid,
  .card-title.with-actions {
    display: block;
  }

  .hero-actions,
  .card-actions {
    margin-top: 18px;
  }

  .editor-card {
    margin-bottom: 22px;
  }
}
</style>
