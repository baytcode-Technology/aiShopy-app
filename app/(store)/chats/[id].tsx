import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatComposer, type OutboundMediaPayload } from "@/components/chat/ChatComposer";
import { ChatMessageActionsSheet } from "@/components/chat/ChatMessageActionsSheet";
import { ForwardMessageModal } from "@/components/chat/ForwardMessageModal";
import { HeaderActionsRow } from "@/components/navigation/HeaderActionsRow";
import { LinkText, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  fetchChatMessages,
  fetchInstagramMessages,
  forwardWhatsAppMessage,
  mapApiMessageToChatMessage,
  mapSocketMessageToChatMessage,
  sendChatMessage,
  sendWhatsAppMediaMessage,
  uploadWhatsAppMedia,
} from "@src/api/chats";
import { prepareWhatsAppMessagesForDisplay } from "@src/lib/prepare-whatsapp-messages";
import { useChatSocket } from "@src/contexts/chat-socket-context";
import { useStore } from "@src/contexts/store-context";
import { useStoreUnread } from "@src/contexts/store-unread-context";
import { showError } from "@src/lib/toast";
import { hasPremiumAccess } from "@src/lib/subscription";
import Colors from "@src/theme/colors";
import type { ChatChannel, ChatMessage } from "@src/types/chat";
import { router, useLocalSearchParams, useFocusEffect, type Href } from "expo-router";
import { useNavigateBackTo } from "@src/hooks/useNavigateBackTo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function initialsFromLabel(label: string, fallback: string) {
  const cleaned = label.replace(/^@/, "").trim();
  if (!cleaned) return fallback;
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return (cleaned.slice(0, 2) || fallback).toUpperCase();
}

function dedupeByIdAndMeta(list: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();
  const out: ChatMessage[] = [];

  for (const m of list) {
    const key = m.metaMessageId ? `meta:${m.metaMessageId}` : `id:${m.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }

  return out;
}

export default function ChatDetailScreen() {
  const { store } = useStore();
  const { markChatRead, setActiveChat, onActiveChatMessage } = useStoreUnread();
  const { onMessageNew, onMessageStatus, onInstagramMessageNew } = useChatSocket();
  const { id, phone, channel: channelParam, displayName } = useLocalSearchParams<{
    id: string;
    phone?: string;
    channel?: string;
    displayName?: string;
  }>();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [actionsMessage, setActionsMessage] = useState<ChatMessage | null>(null);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(null);
  const [forwardVisible, setForwardVisible] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const idRaw = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const conversationId = idRaw ? Number(idRaw) : NaN;
  const customerPhone = typeof phone === "string" ? phone : "";
  const headerLabel =
    typeof displayName === "string" && displayName.trim()
      ? displayName.trim()
      : customerPhone;
  const chatsListHref = "/(store)/chats" as Href;

  useNavigateBackTo(chatsListHref);

  const goBackToChats = () => router.navigate(chatsListHref);
  const channel: ChatChannel =
    channelParam === "instagram" ? "instagram" : "whatsapp";

  useEffect(() => {
    if (store && !hasPremiumAccess(store)) {
      router.replace("/subscription" as Href);
    }
  }, [store]);

  const title = useMemo(() => {
    if (channel === "instagram" && customerPhone && !customerPhone.startsWith("@")) {
      return customerPhone.length > 12 ? `IG ${customerPhone.slice(0, 8)}…` : customerPhone;
    }
    return headerLabel || "Chat";
  }, [channel, customerPhone, headerLabel]);

  const loadMessages = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!store?.id || !Number.isFinite(conversationId)) return;
      const silent = options?.silent ?? false;
      if (!silent) setIsLoading(true);
      try {
        const res =
          channel === "instagram"
            ? await fetchInstagramMessages({
                storeId: store.id,
                conversationId,
                limit: 50,
              })
            : await fetchChatMessages({
                storeId: store.id,
                conversationId,
                limit: 50,
              });
        const mapped = res.data.messages
          .slice()
          .reverse()
          .map((m) => mapApiMessageToChatMessage(m, store.id));
        setMessages(
          channel === "whatsapp"
            ? prepareWhatsAppMessagesForDisplay(mapped)
            : mapped,
        );
      } catch (e: unknown) {
        if (!silent) {
          showError(
            "Failed to load messages",
            e instanceof Error ? e.message : "Unknown error",
          );
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [store?.id, conversationId, channel],
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleMarkReadRef = useRef<() => void>(() => {});

  const scheduleMarkRead = useCallback(() => {
    if (markReadTimerRef.current) {
      clearTimeout(markReadTimerRef.current);
    }
    markReadTimerRef.current = setTimeout(() => {
      markReadTimerRef.current = null;
      void markChatRead(conversationId, channel);
    }, 500);
  }, [conversationId, channel, markChatRead]);

  scheduleMarkReadRef.current = scheduleMarkRead;

  useFocusEffect(
    useCallback(() => {
      if (!Number.isFinite(conversationId)) return;
      setActiveChat({ conversationId, channel });
      void markChatRead(conversationId, channel);
      return () => {
        setActiveChat(null);
        if (markReadTimerRef.current) {
          clearTimeout(markReadTimerRef.current);
          markReadTimerRef.current = null;
        }
      };
    }, [conversationId, channel, markChatRead, setActiveChat]),
  );

  useEffect(() => {
    return onActiveChatMessage((id) => {
      if (id === conversationId) {
        void loadMessages({ silent: true });
      }
    });
  }, [conversationId, onActiveChatMessage, loadMessages]);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  useEffect(() => {
    if (!Number.isFinite(conversationId)) return;

    const handleNew = (payload: {
      conversationId: number;
      message: {
        id: number;
        meta_message_id?: string;
        direction: string;
        type: string;
        text_body: string | null;
        status: string;
        timestamp: string | null;
      };
    }) => {
      if (payload.conversationId !== conversationId || !store?.id) return;
      setMessages((prev) => {
        const incoming = mapSocketMessageToChatMessage(payload.message, store.id);
        if (
          prev.some(
            (m) =>
              m.id === incoming.id ||
              (incoming.metaMessageId &&
                m.metaMessageId === incoming.metaMessageId &&
                incoming.type !== 'reaction'),
          )
        ) {
          return prev;
        }
        const next = dedupeByIdAndMeta([...prev, incoming]);
        return channel === "whatsapp"
          ? prepareWhatsAppMessagesForDisplay(next)
          : next;
      });
      if (payload.message.direction === "inbound") {
        scheduleMarkReadRef.current();
      }
    };

    const unsubWa = onMessageNew(handleNew);
    const unsubIg = onInstagramMessageNew(handleNew);

    const unsubStatus = onMessageStatus((payload) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.metaMessageId === payload.metaMessageId
            ? {
                ...m,
                status: payload.status as ChatMessage["status"],
                pending: false,
              }
            : m,
        ),
      );
    });

    return () => {
      unsubWa();
      unsubIg();
      unsubStatus();
    };
  }, [conversationId, store?.id, channel, onMessageNew, onInstagramMessageNew, onMessageStatus]);

  const previewForMediaType = (type: OutboundMediaPayload["type"]) => {
    if (type === "image") return "Photo";
    if (type === "video") return "Video";
    return "Voice message";
  };

  const sendMediaMessage = async (payload: OutboundMediaPayload) => {
    if (!store?.id || isSending || channel !== "whatsapp") return;

    const tempId = -Date.now();
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        type: payload.type,
        text: previewForMediaType(payload.type),
        time,
        outgoing: true,
        status: "pending",
        pending: true,
      },
    ]);
    setIsSending(true);

    try {
      const uploaded = await uploadWhatsAppMedia({
        storeId: store.id,
        kind: payload.type,
        uri: payload.uri,
        name: payload.name,
        type: payload.mimeType,
      });

      const res = await sendWhatsAppMediaMessage({
        storeId: store.id,
        to: customerPhone,
        conversationId,
        type: payload.type,
        mediaId: uploaded.data.media_id,
        mimeType: uploaded.data.mime_type,
        voice: payload.voice,
      });

      setMessages((prev) =>
        dedupeByIdAndMeta(
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...mapApiMessageToChatMessage(res.data.message, store.id),
                  pending: false,
                }
              : m,
          ),
        ),
      );
    } catch (e: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      showError(e, "Failed to send media");
    } finally {
      setIsSending(false);
    }
  };

  if (!Number.isFinite(conversationId)) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center">
        <Text className="text-center mt-10 text-ink font-semibold">
          Conversation not found
        </Text>
        <Pressable className="mt-4" onPress={goBackToChats}>
          <LinkText>Go back</LinkText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !store?.id || isSending) return;

    const tempId = -Date.now();
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        text,
        time,
        outgoing: true,
        status: "pending",
        pending: true,
      },
    ]);
    setDraft("");
    setIsSending(true);

    try {
      const res = await sendChatMessage({
        storeId: store.id,
        to: customerPhone,
        message: text,
        conversationId,
        channel,
      });

      setMessages((prev) =>
        dedupeByIdAndMeta(
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...mapApiMessageToChatMessage(res.data.message, store.id),
                  pending: false,
                }
              : m,
          ),
        ),
      );
    } catch (e: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
      showError(e, "Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const initials = initialsFromLabel(
    customerPhone,
    channel === "instagram" ? "IG" : "WA",
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
      <View className="flex-row items-center px-3 py-3 bg-brand-primary gap-2.5">
        <Pressable className="p-1" onPress={goBackToChats} hitSlop={12}>
          <FontAwesome
            name="chevron-left"
            size={18}
            color={Colors.brand.onPrimary}
          />
        </Pressable>
        <View className="w-10 h-10 rounded-full bg-gray-600 items-center justify-center">
          {channel === "instagram" ? (
            <FontAwesome name="instagram" size={18} color={Colors.brand.onPrimary} />
          ) : (
            <Text className="text-brand-on-primary font-bold text-sm">
              {initials}
            </Text>
          )}
        </View>
        <View className="flex-1 min-w-0">
          <Text
            className="text-brand-on-primary text-base font-bold"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Muted className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
            {isLoading
              ? "Loading…"
              : channel === "instagram"
                ? "Instagram DM"
                : customerPhone}
          </Muted>
        </View>
        <HeaderActionsRow settingsTone="onPrimary" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              storeId={store?.id}
              onLongPress={(message) => {
                if (channel !== "whatsapp") return;
                setActionsMessage(message);
                setActionsVisible(true);
              }}
            />
          )}
          contentContainerClassName="p-4 pb-2 flex-grow"
          onContentSizeChange={() => {
            listRef.current?.scrollToEnd({ animated: true });
          }}
        />

        <ChatComposer
          draft={draft}
          onChangeDraft={setDraft}
          onSendText={() => void sendMessage()}
          onSendMedia={sendMediaMessage}
          disabled={isSending}
          channel={channel}
        />
      </KeyboardAvoidingView>

      <ChatMessageActionsSheet
        visible={actionsVisible}
        message={actionsMessage}
        onClose={() => {
          setActionsVisible(false);
          setActionsMessage(null);
        }}
        onForward={(message) => {
          setForwardMessage(message);
          setForwardVisible(true);
        }}
      />

      {store?.id ? (
        <ForwardMessageModal
          visible={forwardVisible}
          storeId={store.id}
          sourceConversationId={conversationId}
          message={forwardMessage}
          onClose={() => {
            setForwardVisible(false);
            setForwardMessage(null);
          }}
          onForward={async ({ targetConversationId }) => {
            if (!forwardMessage) return;
            await forwardWhatsAppMessage({
              storeId: store.id,
              sourceMessageId: forwardMessage.id,
              targetConversationId,
            });
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}
