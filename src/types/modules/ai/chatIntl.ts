export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatProvider = 'openai' | 'dashscope';

export interface ChatMessageBody {
  type: 'text' | 'image' | 'error';
  data: string;
}

export interface SSEChunkData {
  type: 'delta' | 'finish' | 'error';
  content?: string;
}

export interface ChatServiceContext {
  messages: ChatMessage[];
  onMessage: (chunk: SSEChunkData | string) => void;
  provider?: ChatProvider;
  model?: string;
}

export interface ChatServiceConfig {
  send: (ctx: ChatServiceContext) => Promise<void>;
}
