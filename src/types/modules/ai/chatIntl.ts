export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatMessageBody {
  type: 'text' | 'image' | 'error';
  data: string;
}

export interface SSEChunkData {
  type: 'delta' | 'finish' | 'error' | any;
  content?: string;
}

export interface ChatServiceContext {
  messages: ChatMessage[];
  onMessage: (chunk: SSEChunkData) => void;
}

export interface ChatServiceConfig {
  send: (ctx: ChatServiceContext) => Promise<void>;
}
