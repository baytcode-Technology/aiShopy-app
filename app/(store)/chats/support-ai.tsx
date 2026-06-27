import { SupportMessageBubble } from "@/components/support/SupportMessageBubble";
import { StarterQuestionChips } from "@/components/support/StarterQuestionChips";
import { IconButton } from "@/components/ui/IconButton";
import { LinkText, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  escalateSupportConversation,
  fetchSupportMessages,
  getOrCreateSupportConversation,
  sendSupportMessage,
} from "@src/api/support";
import { useStore } from "@src/contexts/store-context";
import { useNavigateBackTo } from "@src/hooks/useNavigateBackTo";
import { showError } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import type { SupportConversation, SupportMessage } from "@src/types/support";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapApiMessage(m: {
  id: number;
  conversation_id: number;
  role: SupportMessage["role"];
  content: string;
  created_at: string;
}): SupportMessage {
  return {
    ...m,
    time: formatTime(m.created_at),
  };
}

function merchantStatusBanner(conversation: SupportConversation | null): string | null {
  if (!conversation?.ticket_code) return null;
  const code = conversation.ticket_code;
  if (conversation.status === "closed") {
    return `${code} — Issue resolved. Ask AI anything below.`;
  }
  if (conversation.status === "escalated" && conversation.reply_mode === "manual") {
    return `${code} — Support team is responding.`;
  }
  if (conversation.status === "escalated") {
    return `${code} — Our team is reviewing. AI can still help.`;
  }
  return null;
}

export default function SupportAiScreen() {
  const { store } = useStore();
  const [conversation, setConversation] = useState<SupportConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const listRef = useRef<FlatList<SupportMessage>>(null);

  const chatsListHref = "/(store)/chats" as Href;
  useNavigateBackTo(chatsListHref);

  const loadConversation = useCallback(async () => {
    if (!store?.id) return;
    setIsLoading(true);
    try {
      const res = await getOrCreateSupportConversation(store.id);
      setConversation(res.data.conversation);
      const msgRes = await fetchSupportMessages(store.id, res.data.conversation.id);
      setMessages(msgRes.data.messages.map(mapApiMessage));
    } catch (e: unknown) {
      showError(e, "Failed to load chat");
    } finally {
      setIsLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  useFocusEffect(
    useCallback(() => {
      if (!store?.id || !conversation?.id) return;
      void fetchSupportMessages(store.id, conversation.id)
        .then((res) => {
          setMessages(res.data.messages.map(mapApiMessage));
          setConversation(res.data.conversation);
        })
        .catch(() => undefined);
    }, [store?.id, conversation?.id]),
  );

  useEffect(() => {
    const isManualEscalated =
      conversation?.status === "escalated" &&
      conversation?.reply_mode === "manual";
    if (!store?.id || !conversation?.id || !isManualEscalated) return;

    const interval = setInterval(() => {
      void fetchSupportMessages(store.id, conversation.id)
        .then((res) => {
          setMessages(res.data.messages.map(mapApiMessage));
          setConversation(res.data.conversation);
        })
        .catch(() => undefined);
    }, 12000);

    return () => clearInterval(interval);
  }, [store?.id, conversation?.id, conversation?.status, conversation?.reply_mode]);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length, isSending]);

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? draft).trim();
    if (!text || !store?.id || !conversation?.id || isSending) return;

    const tempId = -Date.now();
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: conversation.id,
        role: "user",
        content: text,
        created_at: now,
        time: formatTime(now),
      },
    ]);
    if (!textOverride) setDraft("");
    setIsSending(true);

    try {
      const res = await sendSupportMessage(store.id, conversation.id, text);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        const next = [...withoutTemp, mapApiMessage(res.data.user_message)];
        if (res.data.assistant_message) {
          next.push(mapApiMessage(res.data.assistant_message));
        }
        return next;
      });
      if (res.data.conversation) {
        setConversation(res.data.conversation);
      }
    } catch (e: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      if (!textOverride) setDraft(text);
      showError(e, "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!store?.id || !conversation?.id || isEscalating) return;
    setIsEscalating(true);
    try {
      const res = await escalateSupportConversation(store.id, conversation.id);
      setConversation(res.data.conversation);
    } catch (e: unknown) {
      showError(e, "Failed to request human support");
    } finally {
      setIsEscalating(false);
    }
  };

  const canChat = Boolean(conversation?.id) && !isLoading;
  const isEscalated = conversation?.status === "escalated";
  const isClosed = conversation?.status === "closed";
  const isManualMode = conversation?.reply_mode === "manual";
  const showAiTyping = isSending && !isManualMode;
  const showTalkWithUs = !isEscalated && (conversation?.status === "active" || isClosed);
  const statusBanner = merchantStatusBanner(conversation);
  const showStarters = canChat && messages.length === 0 && !isSending;

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
      <View className="flex-row items-center px-3 py-3 bg-brand-green gap-2.5">
        <Pressable
          className="p-1"
          onPress={() => router.navigate(chatsListHref)}
          hitSlop={12}
        >
          <FontAwesome
            name="chevron-left"
            size={18}
            color={Colors.brand.onPrimary}
          />
        </Pressable>
        <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
          <FontAwesome name="magic" size={18} color={Colors.brand.onPrimary} />
        </View>
        <View className="flex-1 min-w-0">
          <Text
            className="text-brand-on-primary text-base font-bold"
            numberOfLines={1}
          >
            Chat with AI
          </Text>
          <Muted className="text-white/80 text-xs mt-0.5" numberOfLines={1}>
            Ask us anything about AiShopy
          </Muted>
        </View>
      </View>

      {statusBanner ? (
        <View className="bg-[#E8F8EC] border-b border-brand-green/20 px-4 py-2.5">
          <Text className="text-[13px] text-ink font-medium">{statusBanner}</Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.brand.green} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <SupportMessageBubble message={item} />}
            contentContainerClassName="p-4 pb-2 flex-grow"
            onContentSizeChange={() => {
              listRef.current?.scrollToEnd({ animated: true });
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-12 px-6">
                <FontAwesome
                  name="comments"
                  size={32}
                  color={Colors.brand.green}
                />
                <Text className="text-ink font-semibold text-base mt-4 text-center">
                  Hi! How can we help?
                </Text>
                <Muted className="text-center mt-2 text-[14px] leading-5">
                  Ask about products, orders, WhatsApp setup, or your
                  subscription plan.
                </Muted>
              </View>
            }
          />
        )}

        {showAiTyping ? (
          <View className="flex-row items-center gap-2 px-4 py-2">
            <ActivityIndicator size="small" color={Colors.brand.green} />
            <Muted className="text-[13px]">AI is typing…</Muted>
          </View>
        ) : null}

        {showStarters ? (
          <StarterQuestionChips
            disabled={isSending}
            onSelect={(q) => void sendMessage(q)}
          />
        ) : null}

        {showTalkWithUs ? (
          <Pressable
            className="mx-3 mb-1 py-2"
            onPress={() => void handleEscalate()}
            disabled={isEscalating || isLoading}
          >
            <LinkText className="text-[13px] text-brand-green">
              {isEscalating ? "Requesting…" : "Talk with us"}
            </LinkText>
          </Pressable>
        ) : null}

        <View className="flex-row items-end gap-2.5 px-3 py-2.5 bg-surface border-t border-gray-200">
          <TextInput
            className="flex-1 min-h-11 max-h-[100px] rounded-full border border-gray-200 bg-gray-100 px-4 py-2.5 text-[15px] text-ink"
            placeholder="Type your question…"
            placeholderTextColor={Colors.text.muted}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={2000}
            editable={canChat && !isSending}
          />
          <IconButton
            className="bg-brand-green border-0 w-11 h-11"
            onPress={() => void sendMessage()}
            disabled={!canChat || isSending}
          >
            <FontAwesome name="send" size={16} color={Colors.brand.onPrimary} />
          </IconButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
