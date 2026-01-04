import type { SSEChunkData } from '@/types/modules/ai/chatIntl';

export interface SSEHandlers {
  onMessage: (data: SSEChunkData | string) => void; // 注意这里允许 string
  onError?: (err: any) => void;
  onComplete?: () => void;
}

export const fetchSSE = async (url: string, body: any, handlers: SSEHandlers) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      throw new Error(response.statusText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line) continue;

        // 如果有结束标记
        if (line === '[DONE]') {
          handlers.onMessage({ type: 'finish' });
          continue;
        }

        // 直接返回原始字符串
        handlers.onMessage(line);
      }
    }

    // 剩余 buffer
    if (buffer) {
      handlers.onMessage(buffer);
    }

    handlers.onComplete?.();
  } catch (err) {
    handlers.onError?.(err);
  }
};
