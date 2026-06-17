import { MessageBubble } from "@/components/chat/MessageBubble";
import { HeaderActionsRow } from "@/components/navigation/HeaderActionsRow";
import { IconButton } from "@/components/ui/IconButton";
import { LinkText, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  fetchChatMessages,
  fetchInstagramMessages,
  mapApiMessageToChatMessage,
  mapSocketMessageToChatMessage,
  sendChatMessage,
} from "@src/api/chats";
import { useChatSocket } from "@src/contexts/chat-socket-context";
import { useStore } from "@src/contexts/store-context";
import { useStoreUnread } from "@src/contexts/store-unread-context";
import { showError } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import type { ChatChannel, ChatMessage } from "@src/types/chat";
import { router, useLocalSearchParams, useFocusEffect, type Href } from "expo-router";
import { useNavigateBackTo } from "@src/hooks/useNavigateBackTo";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
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
  const { markChatRead } = useStoreUnread();
  const { onMessageNew, onMessageStatus, onInstagramMessageNew } = useChatSocket();
  const { id, phone, channel: channelParam } = useLocalSearchParams<{
    id: string;
    phone?: string;
    channel?: string;
  }>();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const conversationId = typeof id === "string" ? id : "";
  const customerPhone = typeof phone === "string" ? phone : "";
  const chatsListHref = "/(store)/chats" as Href;

  useNavigateBackTo(chatsListHref);

  const goBackToChats = () => router.navigate(chatsListHref);
  const channel: ChatChannel =
    channelParam === "instagram" ? "instagram" : "whatsapp";
  const title = useMemo(() => {
    if (channel === "instagram" && customerPhone && !customerPhone.startsWith("@")) {
      return customerPhone.length > 12 ? `IG ${customerPhone.slice(0, 8)}…` : customerPhone;
    }
    return customerPhone || "Chat";
  }, [channel, customerPhone]);

  const loadMessages = useCallback(async () => {
    if (!store?.id || !conversationId) return;
    setIsLoading(true);
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
        .map((m) => mapApiMessageToChatMessage(m));
      setMessages(mapped);
    } catch (e: unknown) {
      showError(
        "Failed to load messages",
        e instanceof Error ? e.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [store?.id, conversationId, channel]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useFocusEffect(
    useCallback(() => {
      if (!conversationId) return;
      void markChatRead(conversationId, channel);
    }, [conversationId, channel, markChatRead])
  );

  useEffect(() => {
    if (!conversationId) return;

    const handleNew = (payload: {
      conversationId: string;
      message: {
        id: string;
        meta_message_id?: string;
        direction: string;
        type: string;
        text_body: string | null;
        status: string;
        timestamp: string | null;
      };
    }) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) => {
        const incoming = mapSocketMessageToChatMessage(payload.message);
        if (
          prev.some(
            (m) =>
              m.id === incoming.id ||
              (incoming.metaMessageId &&
                m.metaMessageId === incoming.metaMessageId),
          )
        ) {
          return prev;
        }
        return dedupeByIdAndMeta([...prev, incoming]);
      });
    };

    const unsubWa = onMessageNew(handleNew);
    const unsubIg = onInstagramMessageNew(handleNew);

    const unsubStatus = onMessageStatus((payload) => {
      if (payload.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.metaMessageId === payload.metaMessageId ||
          m.id === payload.metaMessageId
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
  }, [conversationId, onMessageNew, onInstagramMessageNew, onMessageStatus]);

  if (!conversationId) {
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

    const tempId = `local-${Date.now()}`;
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
                  ...mapApiMessageToChatMessage(res.data.message),
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
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerClassName="p-4 pb-2 flex-grow"
        />

        <View className="flex-row items-end gap-2.5 px-3 py-2.5 bg-surface border-t border-gray-200">
          <TextInput
            className="flex-1 min-h-11 max-h-[100px] rounded-full border border-gray-200 bg-gray-100 px-4 py-2.5 text-[15px] text-ink"
            placeholder="Type a message"
            placeholderTextColor={Colors.text.muted}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={2000}
            editable={!isSending}
          />
          <IconButton
            className="bg-brand-primary border-0 w-11 h-11"
            onPress={() => void sendMessage()}
          >
            <FontAwesome name="send" size={16} color={Colors.brand.onPrimary} />
          </IconButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
