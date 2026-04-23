import type {
  ChatConversationCreateResult,
  ChatConversationDetail,
  ChatConversationSummary,
  ChatProvider,
} from '@/types/modules/ai/chatIntl';
import { request } from '@/utils/request';

export function createChatConversation(provider?: ChatProvider, model?: string) {
  return request.post<ChatConversationCreateResult>({
    url: '/ai/chat/conversations',
    data: { provider, model },
  });
}

export function listChatConversations() {
  return request.get<ChatConversationSummary[]>({
    url: '/ai/chat/conversations',
  });
}

export function getChatConversationDetail(conversationId: number) {
  return request.get<ChatConversationDetail>({
    url: `/ai/chat/conversations/${conversationId}`,
  });
}
