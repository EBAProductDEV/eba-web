import type { ChatServiceConfig } from '@/types/modules/ai/chatIntl';

import { fetchSSE } from './fetchSSE';

export const defaultChatServiceConfig: ChatServiceConfig = {
  send: async ({ conversationId, message, onMessage, provider, model, signal }) => {
    const latestUserMessage = message.trim();
    if (!latestUserMessage) {
      onMessage({ type: 'error', content: 'Empty query' });
      return;
    }

    await fetchSSE(
      '/api/ai/chat/stream',
      {
        conversationId: conversationId ?? undefined,
        message: latestUserMessage,
        provider,
        model,
      },
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
        method: 'POST',
        mode: 'sse',
        signal,
        headers: { Accept: 'text/event-stream' },
      },
    );
  },
};
