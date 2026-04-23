export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatProvider = 'openai' | 'dashscope';

export interface PersistedChatMessage {
  id: number;
  seqNo: number;
  role: 'user' | 'assistant';
  content: string;
  status: string;
  createdAt: string;
}

export interface ChatConversationSummary {
  id: number;
  title: string;
  preview: string;
  provider: ChatProvider;
  model: string;
  lastMessageAt: string | null;
}

export interface ChatConversationDetail {
  conversationId: number;
  title: string;
  summary: string;
  provider: ChatProvider;
  model: string;
  messages: PersistedChatMessage[];
}

export interface ChatConversationCreateResult {
  conversationId: number;
  title: string;
  provider: ChatProvider;
  model: string;
}

export type SSEChunkData =
  | { type: 'delta'; content?: string }
  | { type: 'finish'; content?: string }
  | { type: 'error'; content?: string }
  | { type: 'meta'; conversationId: number; title?: string };

export interface ChatServiceContext {
  conversationId?: number | null;
  message: string;
  onMessage: (chunk: SSEChunkData | string) => void;
  provider?: ChatProvider;
  model?: string;
  signal?: AbortSignal;
}

export interface ChatServiceConfig {
  send: (ctx: ChatServiceContext) => Promise<void>;
}
