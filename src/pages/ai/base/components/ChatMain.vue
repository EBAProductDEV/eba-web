<template>
  <div class="ai-chat-page">
    <aside class="ai-chat-sidebar">
      <div class="ai-chat-sidebar__header">
        <div class="ai-chat-sidebar__title">AI 助手工作台</div>
        <t-tag theme="primary" variant="light-outline" size="small">{{ providerLabel }}</t-tag>
      </div>

      <t-button block theme="primary" class="ai-chat-sidebar__new" @click="clearChat">
        <template #icon><add-icon /></template>
        新建对话
      </t-button>

      <div class="ai-chat-sidebar__section">
        <div class="ai-chat-sidebar__section-title">最近会话</div>
        <div class="ai-chat-sidebar__sessions">
          <t-button
            v-for="item in recentConversations"
            :key="item.title"
            variant="text"
            block
            class="ai-chat-sidebar__session"
          >
            <span class="ai-chat-sidebar__session-title">{{ item.title }}</span>
            <span class="ai-chat-sidebar__session-preview">{{ item.preview }}</span>
            <span class="ai-chat-sidebar__session-time">{{ item.time }}</span>
          </t-button>
          <div v-if="recentConversations.length === 0" class="ai-chat-sidebar__placeholder">
            开始提问后将自动生成会话
          </div>
        </div>
      </div>

      <div class="ai-chat-sidebar__section">
        <div class="ai-chat-sidebar__section-title">能力标签</div>
        <div class="ai-chat-sidebar__tags">
          <t-tag size="small">文档总结</t-tag>
          <t-tag size="small">代码解释</t-tag>
          <t-tag size="small">方案输出</t-tag>
          <t-tag size="small">多轮上下文</t-tag>
        </div>
      </div>
    </aside>

    <section class="ai-chat-workbench">
      <header class="ai-chat-header">
        <div class="ai-chat-header__info">
          <h2>智能对话</h2>
          <p>基于 TDesign Chat 组件，支持主流 AI 产品常见的提问、追问和流式回复体验。</p>
        </div>
        <div class="ai-chat-header__controls">
          <t-button variant="outline" size="small" @click="clearChat">
            <template #icon><refresh-icon /></template>
            清空
          </t-button>
        </div>
      </header>

      <div class="ai-chat-main">
        <div v-if="messages.length === 0" class="ai-chat-empty">
          <h3>今天想先完成什么？</h3>
          <p>点击下方模板可快速发起对话，也可以直接在输入区自由提问。</p>
          <div class="ai-chat-prompts">
            <t-card
              v-for="item in quickPrompts"
              :key="item.title"
              class="ai-chat-prompt"
              @click="handleQuickPrompt(item.prompt)"
            >
              <div class="ai-chat-prompt__title">{{ item.title }}</div>
              <div class="ai-chat-prompt__detail">{{ item.detail }}</div>
            </t-card>
          </div>
        </div>

        <div v-else ref="chatContainer" class="ai-chat-thread">
          <div v-for="(msg, index) in messages" :key="index" class="ai-chat-row" :class="[msg.role]">
            <t-chat-message
              :avatar="
                msg.role === 'user'
                  ? 'https://tdesign.gtimg.com/site/avatar.jpg'
                  : 'https://tdesign.gtimg.com/site/chat-avatar.png'
              "
              :name="msg.role === 'user' ? '你' : 'AI 助手'"
              :role="msg.role"
              :datetime="msg.datetime"
              class="ai-chat-message"
            >
              <template #content>
                <div
                  class="ai-chat-bubble"
                  :class="[msg.role === 'user' ? 'ai-chat-bubble--user' : 'ai-chat-bubble--assistant']"
                >
                  <p v-for="(line, lineIndex) in msg.contentArray" :key="lineIndex">{{ line }}</p>
                </div>
                <t-chat-actionbar
                  v-if="msg.role === 'assistant' && msg.content"
                  class="ai-chat-actionbar"
                  :content="msg.content"
                  :action-bar="assistantActionBar"
                  @operation="handleAssistantOperation($event, index)"
                />
              </template>
            </t-chat-message>
          </div>

          <div v-if="loading" class="ai-chat-loading">
            <t-chat-loading animation="gradient" text="AI 正在思考..." />
          </div>
        </div>
      </div>

      <footer class="ai-chat-footer">
        <t-chat-sender
          v-model="query"
          :loading="loading"
          :textarea-props="senderTextareaProps"
          placeholder="输入你的问题，按 Enter 发送"
          @send="handleSenderSend"
          @stop="handleStop"
        >
          <template #footer-prefix>
            <div class="ai-chat-footer__hint">
              <t-tag size="small" variant="light-outline" theme="primary">{{ model }}</t-tag>
              <span>Enter 发送，Shift + Enter 换行</span>
            </div>
          </template>
        </t-chat-sender>
      </footer>
    </section>
  </div>
</template>
<script setup lang="ts">
import { AddIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { computed, nextTick, reactive, ref, watch } from 'vue';

import { defaultChatServiceConfig } from '@/api/modules/ai/chatServiceConfig';
import type { ChatMessage, ChatProvider, ChatServiceConfig, SSEChunkData } from '@/types/modules/ai/chatIntl';

const props = defineProps<{ chatServiceConfig?: ChatServiceConfig }>();
const service = computed(() => props.chatServiceConfig ?? defaultChatServiceConfig);

interface DisplayMessage extends ChatMessage {
  datetime: string;
  contentArray: string[];
}

const assistantActionBar: Array<'copy' | 'good' | 'bad' | 'replay'> = ['copy', 'good', 'bad', 'replay'];

const provider = ref<ChatProvider>('openai');
const model = ref('gpt-5.4');
const providerLabel = 'OpenAI';

const messages = ref<DisplayMessage[]>([]);
const query = ref('');
const loading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);
const requestVersion = ref(0);

const senderTextareaProps = {
  autosize: { minRows: 1, maxRows: 6 },
};

const quickPrompts = [
  {
    title: '周报自动整理',
    detail: '将零散记录整理成结构化周报，附下周计划',
    prompt: '请帮我把本周工作整理成周报，分为成果、问题、下周计划三部分。',
  },
  {
    title: '需求评审助手',
    detail: '识别需求风险并给出验收标准建议',
    prompt: '你是产品评审助手，请帮我列出这个需求在技术和体验上的风险点，并给出验收标准模板。',
  },
  {
    title: '代码优化建议',
    detail: '从可维护性和性能两个维度给出改进方案',
    prompt: '请作为资深前端工程师，给我一份 Vue 页面重构建议，重点提升可维护性和交互体验。',
  },
  {
    title: '会议纪要总结',
    detail: '自动提炼行动项、负责人和截止时间',
    prompt: '请帮我整理会议纪要，输出决策结论、行动项、负责人和截止时间。',
  },
];

const nowTime = () => {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const scrollToBottom = () => {
  nextTick(() => {
    const el = chatContainer.value;
    if (el) {
      try {
        el.scrollTop = el.scrollHeight;
      } catch (error) {
        console.warn('Scroll failed', error);
      }
    }
  });
};

const splitLines = (content: string) => (content ? content.split('\n') : ['']);

const clearChat = () => {
  requestVersion.value += 1;
  loading.value = false;
  messages.value = [];
  query.value = '';
};

const conversationTitle = computed(() => {
  const firstUserMessage = messages.value.find((item) => item.role === 'user')?.content ?? '';
  if (!firstUserMessage) return '新对话';
  return firstUserMessage.slice(0, 20);
});

const conversationPreview = computed(() => {
  const latest = [...messages.value].reverse().find((item) => item.content.trim())?.content ?? '';
  return latest.slice(0, 28) || '等待输入...';
});

const recentConversations = computed(() => {
  if (!messages.value.length) return [];

  return [
    {
      title: conversationTitle.value,
      preview: conversationPreview.value,
      time: messages.value[messages.value.length - 1]?.datetime ?? nowTime(),
    },
  ];
});

const handleQuickPrompt = (prompt: string) => {
  handleSend(prompt);
};

const handleSenderSend = (value: string) => {
  handleSend(value);
};

const handleStop = () => {
  requestVersion.value += 1;
  loading.value = false;
};

const handleAssistantOperation = (operation: string, index: number) => {
  if (operation !== 'replay' || loading.value) return;

  const latestUserMessage = [...messages.value.slice(0, index)].reverse().find((item) => item.role === 'user');
  if (!latestUserMessage?.content) return;

  handleSend(latestUserMessage.content);
};

const handleSend = async (presetText?: string) => {
  const text = (presetText ?? query.value ?? '').trim();
  if (!text || loading.value) return;

  const currentRequestVersion = requestVersion.value + 1;
  requestVersion.value = currentRequestVersion;

  const userMessage: DisplayMessage = {
    role: 'user',
    content: text,
    datetime: nowTime(),
    contentArray: [text],
  };
  const assistantMessage = reactive<DisplayMessage>({
    role: 'assistant',
    content: '',
    datetime: nowTime(),
    contentArray: [],
  });

  messages.value.push(userMessage, assistantMessage);
  query.value = '';
  loading.value = true;

  scrollToBottom();

  const history = messages.value.slice(0, -1);
  try {
    await service.value.send({
      messages: history,
      provider: provider.value,
      model: model.value,
      onMessage: (chunk: SSEChunkData | string) => {
        if (requestVersion.value !== currentRequestVersion) return;

        if (typeof chunk === 'string') {
          assistantMessage.content += chunk;
        } else if (chunk.type === 'delta') {
          assistantMessage.content += chunk.content ?? '';
        } else if (chunk.type === 'error') {
          assistantMessage.content += `\n[error] ${chunk.content ?? ''}`;
        } else {
          return;
        }

        assistantMessage.contentArray = splitLines(assistantMessage.content);
        // Force list rerender to guarantee token-by-token refresh in all component internals.
        messages.value = [...messages.value];
        scrollToBottom();
      },
    });
  } catch (error) {
    if (requestVersion.value === currentRequestVersion) {
      assistantMessage.content += '\n[error] 请求失败，请稍后重试。';
      assistantMessage.contentArray = splitLines(assistantMessage.content);
      messages.value = [...messages.value];
    }
    console.error('AI send failed', error);
  } finally {
    if (requestVersion.value === currentRequestVersion) {
      loading.value = false;
      scrollToBottom();
    }
  }
};

watch(
  () => messages.value.length,
  () => {
    scrollToBottom();
  },
);
</script>
<style scoped>
.ai-chat-page {
  height: 100%;
  min-height: calc(100vh - var(--td-comp-size-xxxl) - var(--td-comp-paddingTB-xl) * 2);
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
  background:
    radial-gradient(circle at 0 0, rgb(224 240 255 / 80%) 0%, rgb(224 240 255 / 0%) 42%),
    radial-gradient(circle at 100% 0, rgb(223 245 235 / 80%) 0%, rgb(223 245 235 / 0%) 35%), var(--td-bg-color-page);
}

.ai-chat-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgb(15 23 42 / 6%);
  background: rgb(255 255 255 / 82%);
  backdrop-filter: blur(12px);
}

.ai-chat-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-chat-sidebar__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.ai-chat-sidebar__new {
  border-radius: 12px;
}

.ai-chat-sidebar__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-chat-sidebar__section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--td-text-color-placeholder);
}

.ai-chat-sidebar__sessions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-chat-sidebar__session {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: rgb(248 250 252 / 80%);
}

.ai-chat-sidebar__session:hover {
  border-color: rgb(59 130 246 / 20%);
  background: #f1f7ff;
}

.ai-chat-sidebar__session-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.ai-chat-sidebar__session-preview {
  font-size: 12px;
  color: #6b7280;
}

.ai-chat-sidebar__session-time {
  font-size: 11px;
  color: #94a3b8;
}

.ai-chat-sidebar__placeholder {
  font-size: 12px;
  color: #94a3b8;
  padding: 8px 4px;
}

.ai-chat-sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-chat-workbench {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid rgb(15 23 42 / 6%);
  background: rgb(255 255 255 / 92%);
}

.ai-chat-header__info h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.ai-chat-header__info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
}

.ai-chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  border: 1px solid rgb(15 23 42 / 6%);
  background: rgb(255 255 255 / 96%);
  padding: 20px;
  min-height: 520px;
}

.ai-chat-empty h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.ai-chat-empty p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.ai-chat-prompts {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ai-chat-prompt {
  text-align: left;
  cursor: pointer;
  border-radius: 14px;
  border: 1px solid rgb(148 163 184 / 25%);
  background: linear-gradient(145deg, #fff 0%, #f7fbff 100%);
  transition: all 0.2s ease;
}

.ai-chat-prompt:hover {
  transform: translateY(-1px);
  border-color: rgb(59 130 246 / 32%);
  box-shadow: 0 10px 18px rgb(15 23 42 / 8%);
}

.ai-chat-prompt__title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.ai-chat-prompt__detail {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
}

.ai-chat-thread {
  height: 100%;
  overflow-y: auto;
  padding: 8px 4px 24px;
}

.ai-chat-row {
  display: flex;
  margin-bottom: 16px;
}

.ai-chat-row.user {
  justify-content: flex-end;
}

.ai-chat-row.assistant {
  justify-content: flex-start;
}

.ai-chat-message {
  width: fit-content;
  max-width: min(720px, 82vw);
}

.ai-chat-row.user :deep(.t-chat-message) {
  flex-direction: row-reverse;
}

.ai-chat-row.user :deep(.t-chat-message__content) {
  align-items: flex-end;
}

.ai-chat-row.user :deep(.t-chat-message__name),
.ai-chat-row.user :deep(.t-chat-message__datetime) {
  text-align: right;
}

.ai-chat-bubble {
  max-width: 100%;
  border-radius: 14px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 8px 18px rgb(15 23 42 / 6%);
  line-height: 1.65;
  font-size: 14px;
  color: #0f172a;
}

.ai-chat-bubble--assistant {
  background: #fff;
}

.ai-chat-bubble--user {
  border-color: rgb(59 130 246 / 35%);
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.ai-chat-row.user .ai-chat-bubble {
  border-top-right-radius: 6px;
}

.ai-chat-row.assistant .ai-chat-bubble {
  border-top-left-radius: 6px;
}

.ai-chat-bubble p {
  margin: 0;
  white-space: pre-wrap;
}

.ai-chat-actionbar {
  margin-top: 8px;
}

.ai-chat-loading {
  margin-top: 4px;
  padding-left: 50px;
}

.ai-chat-footer {
  padding: 12px 20px 18px;
  border-top: 1px solid rgb(15 23 42 / 5%);
  background: rgb(255 255 255 / 95%);
}

.ai-chat-footer__hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

:deep(.t-chat-sender__textarea) {
  border: 1px solid #dbe6f4;
  background: #f8fbff;
  border-radius: 14px;
  box-shadow: none;
}

:deep(.t-chat-sender__textarea--focus) {
  border-color: rgb(59 130 246 / 50%);
}

:deep(.t-chat-sender__button .t-button) {
  border-radius: 12px;
}

@media (width <= 1200px) {
  .ai-chat-page {
    grid-template-columns: 1fr;
  }

  .ai-chat-sidebar {
    order: 2;
  }

  .ai-chat-workbench {
    order: 1;
  }
}
</style>
