<template>
  <div>
    <chat-main></chat-main>
  </div>
</template>
<script setup lang="ts">
import type { AIMessageContent, ChatServiceConfig, SSEChunkData } from '@tdesign-vue-next/chat';

import ChatMain from './components/ChatMain.vue';

/**
 * 快速开始示例
 *
 * 学习目标：
 * - 了解 Chatbot 组件的最小配置
 * - 理解 endpoint 和 onMessage 的作用
 * - 实现一个基于SSE流式传输的最简可用的对话界面
 */
defineOptions({
  name: 'AIBase',
});
// 聊天服务配置
const _chatServiceConfig: ChatServiceConfig = {
  // 对话服务地址
  endpoint: '/api/ai/agent/chat',
  // endpoint: 'https://1257786608-9i9j1kpa67.ap-guangzhou.tencentscf.com/sse/normal',
  // 开启流式传输
  stream: true,
  onRequest: () => {
    return {
      body: JSON.stringify({
        question: '你是',
      }),
    };
  },
  // 解析后端返回的数据，转换为组件所需格式
  onMessage: (chunk: SSEChunkData): AIMessageContent => {
    return {
      type: 'markdown',
      data: String(chunk.data ?? ''),
    };
  },
};
</script>
<style scoped lang="less">
.ai-base-container {
  padding: 24px;
}

.ai-content {
  padding: 20px 0;

  h2 {
    margin-bottom: 16px;
    font-size: 24px;
    color: var(--td-text-color-primary);
  }

  p {
    color: var(--td-text-color-secondary);
    font-size: 16px;
  }
}
</style>
