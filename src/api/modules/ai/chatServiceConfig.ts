import type { ChatServiceConfig } from '@/types/modules/ai/chatIntl';

import { fetchSSE } from './fetchSSE';

export const defaultChatServiceConfig: ChatServiceConfig = {
  send: async ({ messages, onMessage }) => {
    const last = messages[messages.length - 2];
    await fetchSSE(
      '/api/ai/agent/chat',
      { prompt: last.content },
      {
        onMessage: (data) => {
          if (typeof data === 'string') {
            onMessage({ type: 'text', content: data });
          } else {
            onMessage(data);
          }
        },
        onError: () => {
          onMessage({ type: 'error', content: '默认 AI 服务异常' });
        },
      },
    );
  },
};
