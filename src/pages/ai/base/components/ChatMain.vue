<template>
  <div class="ai-chat-page">
    <aside class="ai-chat-sidebar">
      <div class="ai-chat-sidebar__header">
        <div class="ai-chat-sidebar__title">AI Assistant Workspace</div>
        <t-tag theme="primary" variant="light-outline" size="small">{{ providerLabel }}</t-tag>
      </div>

      <t-button block theme="primary" class="ai-chat-sidebar__new" :loading="creatingConversation" @click="clearChat">
        <template #icon><add-icon /></template>
        New Chat
      </t-button>

      <div class="ai-chat-sidebar__section">
        <div class="ai-chat-sidebar__section-title">Recent Conversations</div>
        <div class="ai-chat-sidebar__sessions">
          <t-button
            v-for="item in conversationList"
            :key="item.id"
            variant="text"
            block
            class="ai-chat-sidebar__session"
            :class="{ 'ai-chat-sidebar__session--active': item.id === currentConversationId }"
            @click="openConversation(item.id)"
          >
            <span class="ai-chat-sidebar__session-title">{{ item.title }}</span>
            <span class="ai-chat-sidebar__session-preview">{{ item.preview || 'No preview yet' }}</span>
            <span class="ai-chat-sidebar__session-time">{{ formatConversationTime(item.lastMessageAt) }}</span>
          </t-button>
          <div v-if="conversationList.length === 0" class="ai-chat-sidebar__placeholder">
            Conversations will appear here after you start chatting.
          </div>
        </div>
      </div>

      <div class="ai-chat-sidebar__section">
        <div class="ai-chat-sidebar__section-title">Capabilities</div>
        <div class="ai-chat-sidebar__tags">
          <t-tag size="small">Chat Memory</t-tag>
          <t-tag size="small">Summary</t-tag>
          <t-tag size="small">Code Review</t-tag>
          <t-tag size="small">Workflow</t-tag>
        </div>
      </div>
    </aside>

    <section class="ai-chat-workbench">
      <header class="ai-chat-header">
        <div class="ai-chat-header__info">
          <h2>{{ activeConversationTitle }}</h2>
          <p>Conversation memory is stored on the server, so you can reopen a session and continue later.</p>
        </div>
        <div class="ai-chat-header__controls">
          <t-select
            v-model="provider"
            class="ai-chat-select"
            :options="providerOptions"
            size="small"
            :disabled="loading"
            @change="handleProviderChange"
          />
          <t-select
            v-model="model"
            class="ai-chat-select ai-chat-select--model"
            :options="currentModelOptions"
            size="small"
            :disabled="loading"
          />
          <t-button variant="outline" size="small" :loading="creatingConversation" @click="clearChat">
            <template #icon><refresh-icon /></template>
            New
          </t-button>
        </div>
      </header>

      <div class="ai-chat-main">
        <div v-if="messages.length === 0" class="ai-chat-empty">
          <h3>What do you want to get done today?</h3>
          <p>Pick a prompt or type your own question to start a remembered conversation.</p>
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
              :name="msg.role === 'user' ? 'You' : 'AI Assistant'"
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
            <t-chat-loading animation="gradient" text="AI is thinking..." />
          </div>
        </div>
      </div>

      <footer class="ai-chat-footer">
        <t-chat-sender
          v-model="query"
          :loading="loading"
          :textarea-props="senderTextareaProps"
          placeholder="Ask a question and press Enter"
          @send="handleSenderSend"
          @stop="handleStop"
        >
          <template #footer-prefix>
            <div class="ai-chat-footer__hint">
              <t-tag size="small" variant="light-outline" theme="primary">{{ providerLabel }}</t-tag>
              <t-tag size="small" variant="light-outline" theme="primary">{{ selectedModelLabel }}</t-tag>
              <span>Enter to send, Shift + Enter for newline</span>
            </div>
          </template>
        </t-chat-sender>
      </footer>
    </section>
  </div>
</template>
<script setup lang="ts">
import {
  ChatActionbar as TChatActionbar,
  ChatLoading as TChatLoading,
  ChatMessage as TChatMessage,
  ChatSender as TChatSender,
} from '@tdesign-vue-next/chat';
import dayjs from 'dayjs';
import { AddIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';

import {
  createChatConversation,
  getChatConversationDetail,
  listChatConversations,
} from '@/api/modules/ai/chatConversation';
import { defaultChatServiceConfig } from '@/api/modules/ai/chatServiceConfig';
import type {
  ChatConversationDetail,
  ChatConversationSummary,
  ChatMessage,
  ChatProvider,
  ChatServiceConfig,
  PersistedChatMessage,
  SSEChunkData,
} from '@/types/modules/ai/chatIntl';

const props = defineProps<{ chatServiceConfig?: ChatServiceConfig }>();
const service = computed(() => props.chatServiceConfig ?? defaultChatServiceConfig);

interface DisplayMessage extends ChatMessage {
  datetime: string;
  contentArray: string[];
}

interface ModelOption {
  label: string;
  value: string;
}

const assistantActionBar: Array<'copy' | 'good' | 'bad' | 'replay'> = ['copy', 'good', 'bad', 'replay'];

const provider = ref<ChatProvider>('openai');
const model = ref('gpt-5.3-codex-spark');
const query = ref('');
const loading = ref(false);
const creatingConversation = ref(false);
const chatContainer = ref<HTMLElement | null>(null);
const requestVersion = ref(0);
const currentConversationId = ref<number | null>(null);
const messages = ref<DisplayMessage[]>([]);
const conversationList = ref<ChatConversationSummary[]>([]);
const abortController = ref<AbortController | null>(null);

const providerOptions: Array<{ label: string; value: ChatProvider }> = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'DashScope', value: 'dashscope' },
];

const modelOptions: Record<ChatProvider, ModelOption[]> = {
  openai: [{ label: 'gpt-5.3-codex-spark', value: 'gpt-5.3-codex-spark' }],
  dashscope: [{ label: 'qwen3.5-35b-a3b', value: 'qwen3.5-35b-a3b' }],
};

const providerLabelMap: Record<ChatProvider, string> = {
  openai: 'OpenAI',
  dashscope: 'DashScope',
};

const providerLabel = computed(() => providerLabelMap[provider.value]);
const currentModelOptions = computed(() => modelOptions[provider.value]);
const selectedModelLabel = computed(() => {
  return currentModelOptions.value.find((item) => item.value === model.value)?.label ?? model.value;
});
const activeConversationTitle = computed(() => {
  const active = conversationList.value.find((item) => item.id === currentConversationId.value);
  return active?.title ?? 'New conversation';
});

const senderTextareaProps = {
  autosize: { minRows: 1, maxRows: 6 },
};

const quickPrompts = [
  {
    title: 'Weekly Update',
    detail: 'Turn scattered notes into a concise weekly report with next steps.',
    prompt: 'Please help me convert this week into a weekly report with achievements, blockers, and next week plan.',
  },
  {
    title: 'Requirement Review',
    detail: 'Identify delivery risk and produce acceptance criteria.',
    prompt: 'Review this requirement and list technical risks, UX risks, and a compact acceptance checklist.',
  },
  {
    title: 'Code Optimization',
    detail: 'Focus on maintainability and performance improvements.',
    prompt: 'Act as a senior engineer and suggest a refactor plan that improves maintainability and performance.',
  },
  {
    title: 'Meeting Summary',
    detail: 'Extract decisions, owners, and deadlines from meeting notes.',
    prompt: 'Summarize this meeting into decisions, action items, owners, and deadlines.',
  },
];

const splitLines = (content: string) => (content ? content.split('\n') : ['']);

const formatMessageTime = (dateTime?: string | null) => {
  if (!dateTime) return dayjs().format('HH:mm');
  return dayjs(dateTime).format('HH:mm');
};

const formatConversationTime = (dateTime?: string | null) => {
  if (!dateTime) return '--';
  return dayjs(dateTime).format('MM-DD HH:mm');
};

const toDisplayMessage = (message: PersistedChatMessage): DisplayMessage => ({
  role: message.role,
  content: message.content,
  datetime: formatMessageTime(message.createdAt),
  contentArray: splitLines(message.content),
});

const scrollToBottom = () => {
  nextTick(() => {
    const el = chatContainer.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  });
};

const resetModelForProvider = (nextProvider: ChatProvider) => {
  model.value = modelOptions[nextProvider][0]?.value ?? '';
};

const cancelStreaming = () => {
  abortController.value?.abort();
  abortController.value = null;
  requestVersion.value += 1;
  loading.value = false;
};

const loadConversationList = async () => {
  conversationList.value = await listChatConversations();
};

const syncConversationMeta = (conversationId: number, title?: string) => {
  const existing = conversationList.value.find((item) => item.id === conversationId);
  if (existing) {
    if (title) {
      existing.title = title;
    }
    return;
  }
  conversationList.value.unshift({
    id: conversationId,
    title: title ?? 'New conversation',
    preview: '',
    provider: provider.value,
    model: model.value,
    lastMessageAt: null,
  });
};

const openConversation = async (conversationId: number) => {
  if (loading.value) {
    cancelStreaming();
  }
  const detail: ChatConversationDetail = await getChatConversationDetail(conversationId);
  currentConversationId.value = detail.conversationId;
  provider.value = detail.provider;
  model.value = detail.model;
  messages.value = detail.messages.map(toDisplayMessage);
  scrollToBottom();
};

const createConversationForCurrentSelection = async () => {
  creatingConversation.value = true;
  try {
    const created = await createChatConversation(provider.value, model.value);
    currentConversationId.value = created.conversationId;
    syncConversationMeta(created.conversationId, created.title);
    await loadConversationList();
    return created.conversationId;
  } finally {
    creatingConversation.value = false;
  }
};

const clearChat = async () => {
  cancelStreaming();
  messages.value = [];
  query.value = '';
  await createConversationForCurrentSelection();
};

const handleProviderChange = (value: unknown) => {
  if (typeof value !== 'string') return;
  if (value !== 'openai' && value !== 'dashscope') return;
  resetModelForProvider(value);
};

const handleQuickPrompt = (prompt: string) => {
  handleSend(prompt);
};

const handleSenderSend = (value: string) => {
  handleSend(value);
};

const handleStop = () => {
  cancelStreaming();
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

  let conversationId = currentConversationId.value;
  if (!conversationId) {
    conversationId = await createConversationForCurrentSelection();
  }

  const currentRequestVersion = requestVersion.value + 1;
  requestVersion.value = currentRequestVersion;

  const userMessage: DisplayMessage = {
    role: 'user',
    content: text,
    datetime: formatMessageTime(),
    contentArray: [text],
  };
  const assistantMessage = reactive<DisplayMessage>({
    role: 'assistant',
    content: '',
    datetime: formatMessageTime(),
    contentArray: [],
  });

  messages.value.push(userMessage, assistantMessage);
  query.value = '';
  loading.value = true;

  const controller = new AbortController();
  abortController.value = controller;

  scrollToBottom();

  await service.value.send({
    conversationId,
    message: text,
    provider: provider.value,
    model: model.value,
    signal: controller.signal,
    onMessage: (chunk: SSEChunkData | string) => {
      if (requestVersion.value !== currentRequestVersion) return;

      if (typeof chunk === 'string') {
        assistantMessage.content += chunk;
      } else if (chunk.type === 'meta') {
        currentConversationId.value = chunk.conversationId;
        syncConversationMeta(chunk.conversationId, chunk.title);
      } else if (chunk.type === 'delta') {
        assistantMessage.content += chunk.content ?? '';
      } else if (chunk.type === 'error') {
        assistantMessage.content += `\n[error] ${chunk.content ?? ''}`;
      } else {
        return;
      }

      assistantMessage.contentArray = splitLines(assistantMessage.content);
      messages.value = [...messages.value];
      scrollToBottom();
    },
  });

  if (requestVersion.value === currentRequestVersion) {
    loading.value = false;
    abortController.value = null;
    await loadConversationList();
    scrollToBottom();
  }
};

onMounted(async () => {
  await loadConversationList();
  if (conversationList.value.length > 0) {
    await openConversation(conversationList.value[0].id);
  } else {
    await createConversationForCurrentSelection();
  }
});

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

.ai-chat-sidebar__session:hover,
.ai-chat-sidebar__session--active {
  border-color: rgb(59 130 246 / 20%);
  background: #f1f7ff;
}

.ai-chat-sidebar__session-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.ai-chat-sidebar__session-preview {
  width: 100%;
  overflow: hidden;
  color: #64748b;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-chat-sidebar__session-time {
  font-size: 12px;
  color: #94a3b8;
}

.ai-chat-sidebar__placeholder {
  font-size: 13px;
  color: #94a3b8;
}

.ai-chat-sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-chat-workbench {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: rgb(255 255 255 / 88%);
  box-shadow: 0 18px 48px rgb(15 23 42 / 8%);
}

.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgb(226 232 240 / 80%);
}

.ai-chat-header__info h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.ai-chat-header__info p {
  margin: 6px 0 0;
  color: #64748b;
}

.ai-chat-header__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ai-chat-select {
  width: 140px;
}

.ai-chat-select--model {
  width: 220px;
}

.ai-chat-main {
  flex: 1;
  overflow: hidden;
  padding: 0 24px;
}

.ai-chat-empty {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.ai-chat-empty h3 {
  margin: 0;
  font-size: 28px;
}

.ai-chat-empty p {
  max-width: 560px;
  margin: 0;
  color: #64748b;
}

.ai-chat-prompts {
  display: grid;
  width: 100%;
  max-width: 880px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.ai-chat-prompt {
  cursor: pointer;
  border-radius: 16px;
  border: 1px solid rgb(148 163 184 / 12%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.ai-chat-prompt:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgb(37 99 235 / 10%);
}

.ai-chat-prompt__title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.ai-chat-prompt__detail {
  margin-top: 8px;
  color: #64748b;
}

.ai-chat-thread {
  height: 100%;
  overflow: auto;
  padding: 24px 0;
}

.ai-chat-row {
  display: flex;
  margin-bottom: 20px;
}

.ai-chat-row.user {
  justify-content: flex-end;
}

.ai-chat-row.assistant {
  justify-content: flex-start;
}

.ai-chat-message {
  max-width: min(860px, 100%);
}

.ai-chat-bubble {
  padding: 14px 16px;
  border-radius: 16px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.ai-chat-bubble--assistant {
  border: 1px solid rgb(148 163 184 / 12%);
  background: #f8fafc;
  color: #0f172a;
}

.ai-chat-bubble--user {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
}

.ai-chat-bubble p {
  margin: 0;
}

.ai-chat-actionbar {
  margin-top: 8px;
}

.ai-chat-loading {
  display: flex;
  justify-content: flex-start;
}

.ai-chat-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid rgb(226 232 240 / 80%);
}

.ai-chat-footer__hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

:deep(.t-chat-sender__textarea) {
  border-radius: 16px;
}

@media (width <= 960px) {
  .ai-chat-page {
    grid-template-columns: 1fr;
  }

  .ai-chat-prompts {
    grid-template-columns: 1fr;
  }

  .ai-chat-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
