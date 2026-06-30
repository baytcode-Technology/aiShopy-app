import { SupportKeyboardChatLayout } from "@/components/support/SupportKeyboardChatLayout";
import { SupportMessageBubble } from "@/components/support/SupportMessageBubble";
import { SupportStatusStrip } from "@/components/support/SupportStatusStrip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";
import { Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  closeSupportTicket,
  fetchSupportAdminMessages,
  markSupportAdminRead,
  sendSupportAdminReply,
  setSupportReplyMode,
} from "@src/api/support";
import { showError } from "@src/lib/toast";
import { usePlatformAdminBack } from "@src/hooks/usePlatformAdminBack";
import Colors from "@src/theme/colors";
import type { SupportConversation, SupportMessage } from "@src/types/support";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  const [isTakingManual, setIsTakingManual] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
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
      await markSupportAdminRead(conversationId);
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
  }, [messages.length, isSending]);

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

  const handleTakeManual = async () => {
    if (!Number.isFinite(conversationId) || isTakingManual) return;
    setIsTakingManual(true);
    try {
      await setSupportReplyMode(conversationId, "manual");
      await load();
    } catch (e: unknown) {
      showError(e, "Failed to take over ticket");
    } finally {
      setIsTakingManual(false);
    }
  };

  const handleConfirmClose = async () => {
    if (!Number.isFinite(conversationId) || isClosing) return;
    setIsClosing(true);
    try {
      await closeSupportTicket(conversationId);
      setShowCloseDialog(false);
      router.back();
    } catch (e: unknown) {
      showError(e, "Failed to close ticket");
    } finally {
      setIsClosing(false);
    }
  };

  const isEscalated = conversation?.status === "escalated";
  const isManual = conversation?.reply_mode === "manual";
  const canTakeManual = isEscalated && !isManual;
  const canReply = isEscalated && isManual;
  const canClose = isEscalated;

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
            {isEscalated && conversation?.ticket_code
              ? ` · ${conversation.ticket_code}`
              : ""}
          </Muted>
        </View>
      </View>

      <SupportStatusStrip conversation={conversation} />

      {canTakeManual || canClose ? (
        <View className="flex-row items-center justify-end gap-2 px-4 py-2.5 bg-surface border-b border-gray-100">
          {canTakeManual ? (
            <Pressable
              onPress={() => void handleTakeManual()}
              disabled={isTakingManual}
              className="rounded-full bg-brand-green px-4 py-2"
            >
              <Text className="text-[13px] font-bold text-brand-on-primary">
                {isTakingManual ? "Taking over…" : "Take manually"}
              </Text>
            </Pressable>
          ) : null}
          {canClose ? (
            <Pressable
              onPress={() => setShowCloseDialog(true)}
              disabled={isClosing}
              className="rounded-full border border-gray-300 px-4 py-2"
            >
              <Text className="text-[13px] font-semibold text-ink">
                Close ticket
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <SupportKeyboardChatLayout
        listRef={listRef}
        footer={
          isSending ? (
            <View className="flex-row items-center gap-2 px-4 py-2">
              <ActivityIndicator size="small" color={Colors.brand.green} />
              <Muted className="text-[13px]">Sending reply…</Muted>
            </View>
          ) : null
        }
        composer={
          canReply ? (
            <View className="flex-row items-end gap-2.5 px-3 py-2.5">
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
          ) : canTakeManual ? (
            <View className="px-4 py-3">
              <Muted className="text-[13px] text-center">
                Tap Take manually to reply to this ticket.
              </Muted>
            </View>
          ) : null
        }
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
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
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
      </SupportKeyboardChatLayout>

      <ConfirmDialog
        visible={showCloseDialog}
        title="Close this ticket?"
        message="Mark this issue as resolved? The merchant can keep chatting with AI in the same thread."
        cancelLabel="No"
        confirmLabel="Yes"
        confirmVariant="primary"
        loading={isClosing}
        onCancel={() => {
          if (!isClosing) setShowCloseDialog(false);
        }}
        onConfirm={() => void handleConfirmClose()}
      />
    </SafeAreaView>
  );
}
