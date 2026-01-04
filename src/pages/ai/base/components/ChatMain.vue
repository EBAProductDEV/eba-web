<template>
  <div class="ai-chat-container">
    <!-- 消息列表 -->
    <div ref="chatContainer" class="chat-messages">
      <div v-for="(msg, index) in messages" :key="index" class="chat-item">
        <t-chat-message
          :avatar="
            msg.role === 'user'
              ? 'https://tdesign.gtimg.com/site/avatar.jpg'
              : 'https://tdesign.gtimg.com/site/avatar-ai.jpg'
          "
          :name="msg.role === 'user' ? '你' : 'AI'"
          :role="msg.role"
          :datetime="msg.datetime"
        >
          <template #content>
            <!-- 每行渲染，避免 map 错误 -->
            <p v-for="(line, i) in msg.contentArray" :key="i">{{ line }}</p>
          </template>
        </t-chat-message>
      </div>
    </div>

    <!-- 输入框 -->
    <t-chat-sender
      v-model="query"
      :stop-disabled="loading"
      :textarea-props="{ placeholder: '请输入消息...' }"
      @send="handleSend"
    >
      <template #suffix="{ renderPresets }">
        <component :is="renderPresets([])" />
      </template>
    </t-chat-sender>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

import { defaultChatServiceConfig } from '@/api/modules/ai/chatServiceConfig';
import type { ChatMessage, ChatServiceConfig, SSEChunkData } from '@/types/modules/ai/chatIntl';

const props = defineProps<{ chatServiceConfig?: ChatServiceConfig }>();
const service = computed(() => props.chatServiceConfig ?? defaultChatServiceConfig);

interface DisplayMessage extends ChatMessage {
  datetime: string;
  contentArray: string[]; // 用于每行渲染
}

const messages = ref<DisplayMessage[]>([]);
const query = ref('');
const loading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

// 获取当前时间字符串
const nowTime = () => {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const el = chatContainer.value;
    if (el) {
      try {
        el.scrollTop = el.scrollHeight;
      } catch (e) {
        console.warn('滚动失败', e);
      }
    }
  });
};

const handleSend = async () => {
  const text = query.value?.trim();
  if (!text) return;

  const userMessage: DisplayMessage = {
    role: 'user',
    content: text,
    datetime: nowTime(),
    contentArray: [text],
  };
  const assistantMessage: DisplayMessage = {
    role: 'assistant',
    content: '',
    datetime: nowTime(),
    contentArray: [],
  };

  messages.value.push(userMessage, assistantMessage);
  loading.value = true;
  query.value = '';

  scrollToBottom(); // 用户消息发送后滚动

  await service.value.send({
    messages: messages.value,
    onMessage: (chunk: SSEChunkData | string) => {
      const str = typeof chunk === 'string' ? chunk : (chunk.content ?? '');
      assistantMessage.content += str;
      // 每次更新 contentArray 以便 map 渲染
      assistantMessage.contentArray = assistantMessage.content.split('\n');
      console.log('流式输出:', assistantMessage.content);
      scrollToBottom();
    },
  });

  loading.value = false;
  scrollToBottom();
};
</script>
<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chat-item p {
  margin: 0;
  white-space: pre-wrap; /* 保留换行符 */
}
</style>
