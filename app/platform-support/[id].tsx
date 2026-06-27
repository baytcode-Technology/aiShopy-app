import { SupportMessageBubble } from "@/components/support/SupportMessageBubble";
import { IconButton } from "@/components/ui/IconButton";
import { Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  closeSupportTicket,
  fetchSupportAdminMessages,
  sendSupportAdminReply,
  setSupportReplyMode,
} from "@src/api/support";
import { showError } from "@src/lib/toast";
import { usePlatformAdminBack } from "@src/hooks/usePlatformAdminBack";
import Colors from "@src/theme/colors";
import type {
  SupportConversation,
  SupportMessage,
  SupportReplyMode,
} from "@src/types/support";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
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

function statusBannerText(conversation: SupportConversation | null): string | null {
  if (!conversation) return null;
  if (conversation.status === "active") {
    return "AI-only chat — view only";
  }
  if (conversation.status === "closed") {
    return "Issue resolved";
  }
  if (conversation.reply_mode === "manual") {
    return "Manual support — you are responding";
  }
  return "Ticket open — AI still replying";
}

export default function PlatformSupportDetailScreen() {
  const goBack = usePlatformAdminBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ? Number(id) : NaN;
  const [conversation, setConversation] = useState<SupportConversation | null>(
    null,
  );
  const [storeName, setStoreName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const listRef = useRef<FlatList<SupportMessage>>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(conversationId)) return;
    setIsLoading(true);
    try {
      const res = await fetchSupportAdminMessages(conversationId);
      const conv = res.data.conversation;
      setConversation(conv);
      setStoreName("store_name" in conv ? String(conv.store_name ?? "") : "");
      setOwnerEmail(
        "owner_email" in conv ? (conv.owner_email as string | null) : null,
      );
      setMessages(
        res.data.messages.map((m) => ({
          ...m,
          time: formatTime(m.created_at),
        })),
      );
    } catch (e: unknown) {
      showError(e, "Failed to load thread");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  const sendReply = async () => {
    const text = draft.trim();
    if (!text || !Number.isFinite(conversationId) || isSending) return;

    setIsSending(true);
    try {
      const res = await sendSupportAdminReply(conversationId, text);
      const msg = res.data.message;
      setMessages((prev) => [
        ...prev,
        { ...msg, time: formatTime(msg.created_at) },
      ]);
      setDraft("");
    } catch (e: unknown) {
      showError(e, "Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const handleReplyModeChange = async (enabled: boolean) => {
    if (!Number.isFinite(conversationId) || isUpdatingMode) return;
    const nextMode: SupportReplyMode = enabled ? "manual" : "ai";
    setIsUpdatingMode(true);
    try {
      const res = await setSupportReplyMode(conversationId, nextMode);
      setConversation(res.data.conversation);
    } catch (e: unknown) {
      showError(e, "Failed to update reply mode");
    } finally {
      setIsUpdatingMode(false);
    }
  };

  const handleCloseTicket = () => {
    if (!Number.isFinite(conversationId) || isClosing) return;
    Alert.alert(
      "Close ticket",
      "Mark this issue as resolved? The merchant can continue chatting with AI in the same thread.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, close",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsClosing(true);
              try {
                const res = await closeSupportTicket(conversationId);
                setConversation(res.data.conversation);
                router.back();
              } catch (e: unknown) {
                showError(e, "Failed to close ticket");
              } finally {
                setIsClosing(false);
              }
            })();
          },
        },
      ],
    );
  };

  const isEscalated = conversation?.status === "escalated";
  const isManual = conversation?.reply_mode === "manual";
  const canReply = isEscalated && isManual;
  const bannerText = statusBannerText(conversation);

  if (!Number.isFinite(conversationId)) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-ink font-semibold">Conversation not found</Text>
        <Pressable className="mt-4" onPress={goBack}>
          <Text className="text-brand-green font-medium">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
      <View className="flex-row items-center px-3 py-3 bg-ink gap-2.5">
        <Pressable className="p-1" onPress={goBack} hitSlop={12}>
          <FontAwesome
            name="chevron-left"
            size={18}
            color={Colors.brand.onPrimary}
          />
        </Pressable>
        <View className="flex-1 min-w-0">
          <Text
            className="text-brand-on-primary text-base font-bold"
            numberOfLines={1}
          >
            {storeName || "Support thread"}
          </Text>
          <Muted className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
            {ownerEmail ?? "—"}
            {conversation?.ticket_code ? ` · ${conversation.ticket_code}` : ""}
          </Muted>
        </View>
      </View>

      {bannerText ? (
        <View className="bg-[#E8F8EC] border-b border-brand-green/20 px-4 py-2.5">
          <Text className="text-[13px] text-ink font-medium">{bannerText}</Text>
        </View>
      ) : null}

      {isEscalated ? (
        <View className="flex-row items-center justify-between px-4 py-3 bg-surface border-b border-gray-100">
          <View className="flex-row items-center gap-2 flex-1">
            <Text className="text-[14px] text-ink font-medium">Manual reply</Text>
            <Switch
              value={isManual}
              onValueChange={(v) => void handleReplyModeChange(v)}
              disabled={isUpdatingMode || isClosing}
              trackColor={{ false: Colors.gray200, true: Colors.brand.green }}
              thumbColor="#fff"
            />
          </View>
          <Pressable
            onPress={handleCloseTicket}
            disabled={isClosing}
            className="rounded-full border border-gray-300 px-3 py-1.5"
          >
            <Text className="text-[13px] font-semibold text-ink">
              {isClosing ? "Closing…" : "Close ticket"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              <View className="flex-1 items-center justify-center py-12">
                <Muted>No messages in this thread</Muted>
              </View>
            }
          />
        )}

        {canReply ? (
          <View className="flex-row items-end gap-2.5 px-3 py-2.5 bg-surface border-t border-gray-200">
            <TextInput
              className="flex-1 min-h-11 max-h-[100px] rounded-full border border-gray-200 bg-gray-100 px-4 py-2.5 text-[15px] text-ink"
              placeholder="Reply as AiShopy team…"
              placeholderTextColor={Colors.text.muted}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={2000}
              editable={!isSending && !isLoading}
            />
            <IconButton
              className="bg-brand-green border-0 w-11 h-11"
              onPress={() => void sendReply()}
              disabled={!draft.trim() || isSending}
            >
              <FontAwesome
                name="send"
                size={16}
                color={Colors.brand.onPrimary}
              />
            </IconButton>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
