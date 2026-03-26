import type { SSEChunkData } from '@/types/modules/ai/chatIntl';

export interface SSEHandlers {
  onMessage: (data: SSEChunkData | string) => void;
  onError?: (err: any) => void;
  onComplete?: () => void;
}

export interface SSEFetchOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
  mode?: 'sse' | 'raw' | 'auto';
  signal?: AbortSignal;
}

const buildQuery = (query?: SSEFetchOptions['query']) => {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    params.append(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchSSE = async (url: string, body: any, handlers: SSEHandlers, options: SSEFetchOptions = {}) => {
  try {
    const method = options.method ?? 'POST';
    const finalUrl = `${url}${buildQuery(options.query)}`;
    const headers = {
      ...(method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
    };
    const init: RequestInit = {
      method,
      headers,
      signal: options.signal,
    };
    if (method !== 'GET') {
      init.body = JSON.stringify(body ?? {});
    }

    const response = await fetch(finalUrl, init);

    if (!response.ok || !response.body) {
      throw new Error(response.statusText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let mode: SSEFetchOptions['mode'] = options.mode ?? 'auto';
    if (mode === 'auto') {
      const contentType = response.headers.get('content-type') ?? '';
      mode = contentType.includes('text/event-stream') ? 'sse' : 'raw';
    }

    const emitSseData = (rawData: string) => {
      let data = rawData;
      if (data.startsWith(' ')) data = data.slice(1);
      if (!data && data !== '') return;
      if (data === '[DONE]') {
        handlers.onMessage({ type: 'finish' });
        return;
      }
      try {
        const parsed = JSON.parse(data) as SSEChunkData;
        handlers.onMessage(parsed);
      } catch {
        handlers.onMessage(data);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      if (mode === 'raw') {
        if (chunkText) {
          handlers.onMessage(chunkText);
        }
        continue;
      }

      buffer += chunkText;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        emitSseData(line.slice(5));
      }
    }

    if (mode !== 'raw' && buffer.startsWith('data:')) {
      emitSseData(buffer.slice(5));
    }

    handlers.onComplete?.();
  } catch (err) {
    handlers.onError?.(err);
  }
};
