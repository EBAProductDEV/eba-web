import type { ChatServiceConfig } from '@/types/modules/ai/chatIntl';

import { fetchSSE } from './fetchSSE';

export const defaultChatServiceConfig: ChatServiceConfig = {
  send: async ({ messages, onMessage, provider, model }) => {
    const latestUser = [...messages].reverse().find((item) => item.role === 'user');
    const latestUserMessage = latestUser?.content?.trim() || '';
    if (!latestUserMessage) {
      onMessage({ type: 'error', content: 'Empty query' });
      return;
    }

    await fetchSSE(
      '/api/ai/chat/stream',
      { provider, model, messages },
      {
        onMessage: (data) => {
          if (typeof data === 'string') {
            onMessage({ type: 'delta', content: data });
          } else {
            onMessage(data);
          }
        },
        onError: () => {
          onMessage({ type: 'error', content: 'AI service error (stream parsing/network failed)' });
        },
      },
      {
        method: 'GET',
        mode: 'sse',
        headers: { Accept: 'text/event-stream' },
        query: { query: latestUserMessage },
      },
    );
  },
};
