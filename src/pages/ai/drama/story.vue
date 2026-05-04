<template>
  <div class="story-page">
    <button class="back-button" @click="router.push(`/ai/drama/projects/${projectId}`)">返回项目详情</button>

    <t-loading :loading="loading" text="加载故事内容中...">
      <template v-if="detail">
        <section class="story-hero">
          <div class="hero-content">
            <span class="badge">第一步</span>
            <div class="title-row">
              <h1>{{ detail.name }}</h1>
              <span class="title-label">故事名称</span>
            </div>
            <div class="summary-inline">
              <t-textarea
                v-model="form.storySummary"
                placeholder="放故事摘要：用 1 到 3 句话说明这部短剧讲了什么、主角是谁、核心冲突是什么。"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </div>
          </div>
          <div class="hero-actions">
            <t-button class="hero-action-button" theme="primary" :loading="generating" @click="handleGenerateAll">
              AI 生成故事
            </t-button>
            <t-button class="hero-action-button" variant="outline" :loading="saving" @click="handleSave">
              保存当前内容
            </t-button>
          </div>
        </section>

        <section class="editor-card original-card" :class="{ 'original-card--assistant-open': assistantVisible }">
          <div class="card-title with-actions">
            <div>
              <h2>故事原文</h2>
              <span>
                这里写完整小说式故事正文。右侧 AI
                助手只处理短剧故事、小说原文、剧情结构、角色、冲突、爽点、悬念和文风修改。
              </span>
            </div>
            <div class="card-actions">
              <t-button class="assistant-toggle-button" variant="outline" @click="toggleStoryAssistant">
                <span class="assistant-toggle-button__icon">AI</span>
                {{ assistantVisible ? '收起故事助手' : '打开故事助手' }}
              </t-button>
              <t-button
                class="card-action-button preview-button"
                size="small"
                variant="text"
                @click="openDetail('original')"
              >
                查看详情
              </t-button>
            </div>
          </div>

          <div class="story-workbench">
            <div class="story-editor-pane">
              <t-textarea
                v-model="form.originalStory"
                placeholder="在这里粘贴或编写故事原文。AI 助手修改后，会直接把修改后的完整故事原文回填到这个编辑框里。"
                :autosize="false"
              />
            </div>

            <aside v-if="assistantVisible" class="inline-assistant-panel">
              <div class="assistant-header">
                <div>
                  <span class="assistant-kicker">故事原文专用</span>
                  <h3>AI 修改助手</h3>
                </div>
                <button class="assistant-close" type="button" @click="assistantVisible = false">关闭</button>
              </div>

              <div class="assistant-rule">
                <p>
                  {{
                    assistantMode === 'plan'
                      ? '计划模式下，AI 会先输出修改方案；你确认后才会真正修改左侧故事原文。'
                      : '对话模式下，AI 会直接回答问题；如果你要求修改，它会直接改写左侧故事原文。'
                  }}
                </p>
              </div>

              <div ref="assistantMessagesRef" class="assistant-messages">
                <div v-if="assistantMessages.length === 0" class="assistant-empty">
                  <div class="assistant-empty__icon">AI</div>
                  <p>可以输入：加强开头冲突、把主角动机写清楚、压缩节奏、增强反转、把文风改成短剧爽文。</p>
                </div>
                <div
                  v-for="(message, index) in assistantMessages"
                  :key="`${message.role}-${index}`"
                  class="assistant-message"
                  :class="`assistant-message--${message.role}`"
                >
                  <div class="assistant-message__role">{{ message.role === 'user' ? '你的要求' : 'AI 回复' }}</div>
                  <div class="assistant-message__content">{{ message.content }}</div>
                </div>
              </div>

              <div class="assistant-input">
                <div v-if="pendingPlan" class="pending-plan">
                  <div>
                    <strong>已有待确认方案</strong>
                    <span>确认后 AI 会按这份方案修改故事原文。</span>
                  </div>
                  <t-button size="small" theme="primary" :loading="assistantSending" @click="confirmAssistantPlan">
                    确认执行方案
                  </t-button>
                </div>
                <t-textarea
                  v-model="assistantQuestion"
                  placeholder="输入对故事原文的修改或分析要求，例如：把开头改得更有冲突，或总结下讲了什么。Ctrl + Enter 发送。"
                  :autosize="{ minRows: 4, maxRows: 7 }"
                  @keydown.ctrl.enter.prevent="submitAssistantQuestion"
                />
                <div class="assistant-input__actions">
                  <div class="assistant-mode-row">
                    <span>{{ assistantMode === 'plan' ? '计划模式' : '对话模式' }}</span>
                    <button
                      class="mode-switch"
                      :class="{ 'mode-switch--active': assistantMode === 'plan' }"
                      type="button"
                      @click="toggleAssistantMode"
                    >
                      <span></span>
                    </button>
                  </div>
                  <div class="assistant-send-actions">
                    <t-button variant="text" :disabled="assistantSending" @click="clearAssistantMessages"
                      >清空</t-button
                    >
                    <t-button theme="primary" :loading="assistantSending" @click="submitAssistantQuestion"
                      >发送</t-button
                    >
                  </div>
                </div>
              </div>
            </aside>
          </div>
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

    <t-dialog
      v-model:visible="briefVisible"
      header="确认故事雏形"
      width="960px"
      placement="center"
      attach="body"
      destroy-on-close
      :confirm-loading="generatingContent"
      confirm-btn="开始生成故事"
      cancel-btn="取消"
      @confirm="handleConfirmGenerate"
    >
      <div class="brief-dialog">
        <p class="brief-tip">
          后端已根据当前短剧信息生成一版故事雏形。这里展示的是可给用户确认的故事方向，不是底层提示词。你可以直接调整角色、主线、冲突、爽点和禁用要求，确认后系统会生成故事原文和故事摘要。
        </p>
        <div class="brief-field">
          <label>补充要求</label>
          <t-textarea
            v-model="briefForm.requirement"
            placeholder="例如：更强爽点、女性向、前 3 秒强冲突、结尾必须反转、不要玄幻元素等。"
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </div>
        <div class="brief-field">
          <label>故事雏形</label>
          <t-textarea
            v-model="briefForm.storyBrief"
            placeholder="这里展示 AI 生成的故事雏形，可编辑后再提交。"
            :autosize="{ minRows: 16, maxRows: 24 }"
          />
        </div>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  generateDramaStoryContent,
  getDramaSeriesDetail,
  prepareDramaStoryBrief,
  saveDramaStory,
  streamDramaStoryAssistant,
} from '@/api/modules/ai/drama';
import type {
  DramaSeriesDetail,
  DramaStoryAssistantChatRequest,
  DramaStoryAssistantChatResponse,
  DramaStoryAssistantMessage,
  DramaStorySaveRequest,
} from '@/types/modules/ai/drama';

type StoryBlock = 'original' | 'summary';
type AssistantMode = 'chat' | 'plan';

const route = useRoute();
const router = useRouter();
const projectId = computed(() => Number(route.params.id));

const loading = ref(false);
const saving = ref(false);
const generating = ref(false);
const generatingContent = ref(false);
const detailVisible = ref(false);
const briefVisible = ref(false);
const assistantVisible = ref(false);
const assistantSending = ref(false);
const assistantQuestion = ref('');
const assistantMode = ref<AssistantMode>('chat');
const assistantMessagesRef = ref<HTMLDivElement>();
const detailBlock = ref<StoryBlock>('original');
const detail = ref<DramaSeriesDetail>();
const pendingPlan = ref<{ question: string; content: string }>();

const assistantMessages = ref<DramaStoryAssistantMessage[]>([]);

const form = reactive<DramaStorySaveRequest>({
  originalStory: '',
  storySummary: '',
});

const briefForm = reactive({
  requirement: '',
  storyBrief: '',
});

const blockMeta: Record<StoryBlock, { title: string; empty: string }> = {
  original: { title: '故事原文', empty: '暂无故事原文。' },
  summary: { title: '故事摘要', empty: '暂无故事摘要。' },
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
    });
    detail.value = data;
    fillForm(data);
    MessagePlugin.success('故事内容已保存');
  } finally {
    saving.value = false;
  }
}

async function handleGenerateAll() {
  if (hasStoryData()) {
    MessagePlugin.warning('数据已存在，请删除后再生成');
    return;
  }
  generating.value = true;
  try {
    // 先保存当前编辑区，保证后端生成故事雏形时能读到用户刚输入的故事原文和摘要。
    await handleSave();
    const result = await prepareDramaStoryBrief(projectId.value, { requirement: briefForm.requirement });
    briefForm.storyBrief = result.storyBrief || '';
    briefVisible.value = true;
  } finally {
    generating.value = false;
  }
}

async function handleConfirmGenerate() {
  if (!briefForm.storyBrief?.trim()) {
    MessagePlugin.warning('请先确认或填写故事雏形');
    return;
  }
  if (hasStoryData()) {
    MessagePlugin.warning('数据已存在，请删除后再生成');
    briefVisible.value = false;
    return;
  }
  generatingContent.value = true;
  try {
    const data = await generateDramaStoryContent(projectId.value, {
      storyBrief: briefForm.storyBrief,
      requirement: briefForm.requirement,
    });
    detail.value = data;
    fillForm(data);
    briefVisible.value = false;
    MessagePlugin.success('故事原文和摘要已生成');
    await loadDetail();
  } finally {
    generatingContent.value = false;
  }
}

function hasStoryData() {
  return Boolean(form.originalStory?.trim() || form.storySummary?.trim());
}

function toggleStoryAssistant() {
  assistantVisible.value = !assistantVisible.value;
}

function toggleAssistantMode() {
  assistantMode.value = assistantMode.value === 'plan' ? 'chat' : 'plan';
  pendingPlan.value = undefined;
}

async function submitAssistantQuestion() {
  const question = assistantQuestion.value.trim();
  if (!question) {
    MessagePlugin.warning('请先输入故事修改相关要求');
    return;
  }
  if (!form.originalStory?.trim()) {
    MessagePlugin.warning('故事原文为空，请先填写故事原文后再让 AI 修改');
    return;
  }

  assistantQuestion.value = '';
  pendingPlan.value = undefined;
  await runAssistantStream({
    question,
    mode: assistantMode.value,
  });
}

async function confirmAssistantPlan() {
  if (!pendingPlan.value) return;
  const plan = pendingPlan.value;
  await runAssistantStream(
    {
      question: plan.question,
      mode: 'plan',
      planConfirmed: true,
      planContent: plan.content,
    },
    '确认执行方案',
  );
}

async function runAssistantStream(
  extra: Pick<DramaStoryAssistantChatRequest, 'question' | 'mode' | 'planConfirmed' | 'planContent'>,
  userMessage = extra.question,
) {
  assistantMessages.value.push({ role: 'user', content: userMessage });
  const assistantMessage: DramaStoryAssistantMessage = { role: 'assistant', content: '' };
  assistantMessages.value.push(assistantMessage);
  scrollAssistantMessagesToBottom();
  assistantSending.value = true;
  try {
    let finalResult: DramaStoryAssistantChatResponse | undefined;
    await streamDramaStoryAssistant(
      projectId.value,
      {
        ...extra,
        storySummary: form.storySummary,
        originalStory: form.originalStory,
        history: assistantMessages.value.slice(-10, -2),
      },
      {
        onChunk: (chunk) => {
          assistantMessage.content += chunk;
          scrollAssistantMessagesToBottom();
        },
        onResult: (result) => {
          finalResult = result;
        },
        onError: (message) => {
          assistantMessage.content = message;
        },
      },
    );
    applyAssistantResult(finalResult, assistantMessage);
  } catch (error: any) {
    assistantMessage.content = error?.message || 'AI 助手调用失败';
    MessagePlugin.error(assistantMessage.content);
  } finally {
    assistantSending.value = false;
  }
}

function applyAssistantResult(
  result: DramaStoryAssistantChatResponse | undefined,
  assistantMessage: DramaStoryAssistantMessage,
) {
  if (!result) {
    MessagePlugin.warning('AI 没有返回完整结果');
    return;
  }
  if (!assistantMessage.content) {
    assistantMessage.content = result.answer || '';
  }
  if (result.operation === 'plan' && result.accepted) {
    const userMessageIndex = assistantMessages.value.length - 2;
    pendingPlan.value = {
      question: assistantMessages.value[userMessageIndex]?.content || '',
      content: result.answer || assistantMessage.content,
    };
    MessagePlugin.info('AI 已生成修改方案，确认后才会修改故事原文');
    return;
  }

  const updatedStory = result.originalStory?.trim() || '';
  const hasChanged = updatedStory && updatedStory !== form.originalStory?.trim();
  if (result.accepted && hasChanged) {
    form.originalStory = result.originalStory;
    pendingPlan.value = undefined;
    MessagePlugin.success('AI 已把修改结果回填到故事原文，请确认后保存');
    return;
  }
  if (result.accepted) {
    MessagePlugin.info('AI 已回复，本次没有修改故事原文');
    return;
  }
  MessagePlugin.warning(result.answer || 'AI 未返回可应用的故事原文');
}

function clearAssistantMessages() {
  assistantMessages.value = [];
  pendingPlan.value = undefined;
}

function scrollAssistantMessagesToBottom() {
  nextTick(() => {
    const element = assistantMessagesRef.value;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  });
}

function openDetail(block: StoryBlock) {
  detailBlock.value = block;
  detailVisible.value = true;
}

function getBlockContent(block: StoryBlock) {
  if (block === 'summary') return form.storySummary || '';
  return form.originalStory || '';
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
  gap: 36px;
  padding: 32px;
  margin-bottom: 22px;
}

.hero-content {
  flex: 1;
  min-width: 0;
}

.badge {
  display: inline-flex;
  padding: 6px 12px;
  margin-bottom: 8px;
  color: #6757d8;
  background: #f3f0ff;
  border-radius: 999px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 10px;

  h1 {
    margin: 0;
    color: #202235;
    font-size: 34px;
    line-height: 1.2;
  }
}

.title-label {
  color: #e34d59;
  font-size: 16px;
  font-weight: 600;
}

.summary-inline {
  max-width: 960px;

  :deep(.t-textarea__inner) {
    padding: 0;
    color: #697084;
    line-height: 1.7;
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }

  :deep(.t-textarea__inner:focus) {
    padding: 8px 10px;
    background: #fff;
    border-color: #d9e1ff;
  }
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
  padding-top: 8px;
}

.hero-action-button {
  min-width: 124px;
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

.assistant-toggle-button {
  height: 34px;
  padding: 0 14px 0 10px;
  color: #1f3b77;
  font-weight: 700;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
  border-color: #c8d8ff;
  border-radius: 999px;
}

.assistant-toggle-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 6px;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  background: linear-gradient(135deg, #0052d9 0%, #19a7ce 100%);
  border-radius: 8px;
}

.preview-button {
  color: #596780;
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
    font-size: 22px;
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

.story-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
}

.original-card--assistant-open .story-workbench {
  grid-template-columns: minmax(0, 1fr) 380px;
}

.story-editor-pane {
  min-width: 0;
  height: 680px;
}

.original-card :deep(.t-textarea__inner),
.brief-dialog :deep(.t-textarea__inner),
.assistant-input :deep(.t-textarea__inner) {
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  line-height: 1.8;
}

.story-editor-pane :deep(.t-textarea__inner) {
  height: 680px;
  min-height: 680px;
  max-height: 680px;
  padding: 18px 20px;
  color: #27314a;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  border-color: #e5e9f3;
  border-radius: 18px;
  overflow-y: auto;
  resize: none;
}

.inline-assistant-panel {
  display: flex;
  flex-direction: column;
  height: 680px;
  min-height: 0;
  padding: 18px;
  background:
    radial-gradient(circle at 12% 0%, rgb(0 82 217 / 10%) 0, transparent 32%),
    linear-gradient(180deg, #f8fbff 0%, #fff 46%, #f7f9ff 100%);
  border: 1px solid #dbe6ff;
  border-radius: 20px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;

  h3 {
    margin: 4px 0 0;
    color: #172033;
    font-size: 20px;
  }
}

.assistant-kicker {
  color: #0052d9;
  font-size: 12px;
  font-weight: 700;
}

.assistant-close {
  height: 28px;
  padding: 0 10px;
  color: #667085;
  background: #fff;
  border: 1px solid #e5e9f3;
  border-radius: 999px;
  cursor: pointer;
}

.assistant-rule {
  padding: 12px 14px;
  margin-bottom: 14px;
  color: #52627a;
  line-height: 1.65;
  background: rgb(255 255 255 / 76%);
  border: 1px solid #e4ebff;
  border-radius: 14px;

  p {
    margin: 0;
  }
}

.assistant-mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 128px;
  color: #172033;
  font-weight: 700;
}

.mode-switch {
  position: relative;
  width: 48px;
  height: 26px;
  padding: 0;
  background: #d6dbe7;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease;

  span {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 3px 8px rgb(20 32 56 / 18%);
    transition: transform 0.2s ease;
  }
}

.mode-switch--active {
  background: #0052d9;

  span {
    transform: translateX(22px);
  }
}

.assistant-messages {
  flex: 1;
  min-height: 0;
  padding-right: 4px;
  overflow: hidden auto;
  scrollbar-color: #c8d8ff transparent;
  scrollbar-width: thin;
}

.assistant-messages::-webkit-scrollbar {
  width: 8px;
}

.assistant-messages::-webkit-scrollbar-thumb {
  background: #c8d8ff;
  border-radius: 999px;
}

.assistant-messages::-webkit-scrollbar-track {
  background: transparent;
}

.assistant-empty {
  padding: 34px 18px;
  color: #7b8498;
  text-align: center;
  background: rgb(255 255 255 / 72%);
  border: 1px dashed #d8e0f0;
  border-radius: 18px;

  p {
    max-width: 300px;
    margin: 12px auto 0;
    line-height: 1.7;
  }
}

.assistant-empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #0052d9 0%, #19a7ce 100%);
  border-radius: 18px;
  box-shadow: 0 14px 28px rgb(0 82 217 / 24%);
}

.assistant-message {
  margin-bottom: 14px;
}

.assistant-message__role {
  margin-bottom: 6px;
  color: #8791a5;
  font-size: 12px;
}

.assistant-message__content {
  padding: 12px 14px;
  color: #28344d;
  font-size: 13px;
  line-height: 1.68;
  white-space: pre-wrap;
  background: #fff;
  border: 1px solid #edf1f8;
  border-radius: 14px;
  overflow-wrap: anywhere;
}

.assistant-message--user {
  .assistant-message__role {
    text-align: right;
  }

  .assistant-message__content {
    color: #fff;
    background: #0052d9;
    border-color: #0052d9;
  }
}

.assistant-input {
  flex-shrink: 0;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid #e4ebff;
}

.pending-plan {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fff7e8;
  border: 1px solid #ffd89c;
  border-radius: 14px;

  strong {
    display: block;
    color: #9a5b00;
    font-size: 13px;
  }

  span {
    display: block;
    margin-top: 4px;
    color: #8a6a3d;
    font-size: 12px;
    line-height: 1.5;
  }
}

.assistant-input__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.assistant-send-actions {
  display: flex;
  gap: 8px;
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

.brief-dialog {
  max-height: 72vh;
  overflow: auto;
}

.brief-tip {
  margin: 0 0 18px;
  color: #697084;
  line-height: 1.7;
}

.brief-field {
  margin-bottom: 18px;

  label {
    display: block;
    margin-bottom: 8px;
    color: #202235;
    font-weight: 600;
  }
}

@media (width <= 1260px) {
  .original-card--assistant-open .story-workbench {
    grid-template-columns: minmax(0, 1fr);
  }

  .inline-assistant-panel {
    height: 620px;
  }

  .story-editor-pane,
  .story-editor-pane :deep(.t-textarea__inner) {
    height: 620px;
    min-height: 620px;
    max-height: 620px;
  }
}

@media (width <= 1100px) {
  .story-hero,
  .card-title.with-actions {
    display: block;
  }

  .hero-actions,
  .card-actions {
    margin-top: 18px;
  }
}
</style>
