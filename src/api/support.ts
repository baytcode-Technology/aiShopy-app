import { authenticatedFetch } from "@src/api/client";
import { endpoints } from "@src/api/endpoints";
import type {
  SupportAdminConversation,
  SupportConversation,
  SupportMessage,
  SupportReplyMode,
} from "@src/types/support";

type ApiSupportMessage = Omit<SupportMessage, "time">;

function storeQuery(storeId: number) {
  return `?store_id=${storeId}`;
}

type ConversationResponse = {
  success: boolean;
  data: { conversation: SupportConversation };
};

type MessagesResponse = {
  success: boolean;
  data: { messages: ApiSupportMessage[]; conversation: SupportConversation };
};

type SendMessageResponse = {
  success: boolean;
  data: {
    user_message: ApiSupportMessage;
    assistant_message: ApiSupportMessage | null;
    conversation: SupportConversation | null;
  };
};

type AdminStatusResponse = {
  success: boolean;
  data: { isAdmin: boolean };
};

type AdminConversationsResponse = {
  success: boolean;
  data: { conversations: SupportAdminConversation[]; count: number };
};

type AdminMessagesResponse = {
  success: boolean;
  data: {
    conversation: SupportAdminConversation;
    messages: ApiSupportMessage[];
  };
};

type AdminSendResponse = {
  success: boolean;
  data: { message: ApiSupportMessage };
};

type ReplyModeResponse = {
  success: boolean;
  data: { conversation: SupportAdminConversation };
};

type CloseTicketResponse = {
  success: boolean;
  data: { conversation: SupportAdminConversation };
};

export function getOrCreateSupportConversation(storeId: number) {
  return authenticatedFetch<ConversationResponse>(
    `${endpoints.supportConversation}${storeQuery(storeId)}`,
  );
}

export function fetchSupportMessages(storeId: number, conversationId: number) {
  return authenticatedFetch<MessagesResponse>(
    `${endpoints.supportMessages(conversationId)}${storeQuery(storeId)}`,
  );
}

export function sendSupportMessage(
  storeId: number,
  conversationId: number,
  content: string,
) {
  return authenticatedFetch<SendMessageResponse>(
    `${endpoints.supportMessages(conversationId)}${storeQuery(storeId)}`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
  );
}

export function escalateSupportConversation(
  storeId: number,
  conversationId: number,
) {
  return authenticatedFetch<ConversationResponse>(
    `${endpoints.supportEscalate(conversationId)}${storeQuery(storeId)}`,
    { method: "POST" },
  );
}

export function fetchSupportAdminStatus() {
  return authenticatedFetch<AdminStatusResponse>(endpoints.supportAdminMe);
}

export function fetchSupportAdminConversations() {
  return authenticatedFetch<AdminConversationsResponse>(
    endpoints.supportAdminConversations,
  );
}

export function fetchSupportAdminMessages(conversationId: number) {
  return authenticatedFetch<AdminMessagesResponse>(
    endpoints.supportAdminMessages(conversationId),
  );
}

export function sendSupportAdminReply(conversationId: number, content: string) {
  return authenticatedFetch<AdminSendResponse>(
    endpoints.supportAdminMessages(conversationId),
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
  );
}

export function setSupportReplyMode(
  conversationId: number,
  replyMode: SupportReplyMode,
) {
  return authenticatedFetch<ReplyModeResponse>(
    endpoints.supportAdminReplyMode(conversationId),
    {
      method: "PATCH",
      body: JSON.stringify({ reply_mode: replyMode }),
    },
  );
}

export function closeSupportTicket(conversationId: number) {
  return authenticatedFetch<CloseTicketResponse>(
    endpoints.supportAdminClose(conversationId),
    { method: "POST" },
  );
}
