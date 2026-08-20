import {
  ChatComposer,
  type OutboundMediaPayload,
} from "@/components/chat/ChatComposer";
import { ChatDateSeparator } from "@/components/chat/ChatDateSeparator";
import { ChatMessageActionsSheet } from "@/components/chat/ChatMessageActionsSheet";
import {
  ChatProductSendModal,
  type ProductShareSendPayload,
} from "@/components/chat/ChatProductSendModal";
import { ForwardMessageModal } from "@/components/chat/ForwardMessageModal";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { HeaderActionsRow } from "@/components/navigation/HeaderActionsRow";
import { SupportKeyboardChatLayout } from "@/components/support/SupportKeyboardChatLayout";
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
import { setChatReplyMode } from "@src/api/inbox-ai";
import { useChatSocket } from "@src/contexts/chat-socket-context";
import { ChatVoicePlayerProvider } from "@src/contexts/chat-voice-player-context";
import { useChatVoiceRecording } from "@src/contexts/chat-voice-recording-context";
import { useStore } from "@src/contexts/store-context";
import { useStoreUnread } from "@src/contexts/store-unread-context";
import { useAppTheme } from "@src/contexts/theme-context";
import { useNavigateBackTo } from "@src/hooks/useNavigateBackTo";
import {
  dateLabelFromTimestamp,
  injectChatDateSeparators,
  isDateSeparatorItem,
  stickyDateLabelFromViewableItems,
  type ChatListItem,
} from "@src/lib/chat-date-separators";
import { prepareWhatsAppMessagesForDisplay } from "@src/lib/prepare-whatsapp-messages";
import { toSocketId } from "@src/lib/socket-normalize";
import { hasPremiumAccess } from "@src/lib/subscription";
import { showError } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import type { ChatChannel, ChatMessage } from "@src/types/chat";
import * as FileSystem from "expo-file-system/legacy";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  type Href,
} from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function dedupeByIdAndMeta(list: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();
  const out: ChatMessage[] = [];

  for (const m of list) {
    const key =
      // If we have metaMessageId, prefer it over clientKey/id.
      // This prevents duplicates when:
      // 1) we optimistically add a message with clientKey
      // 2) socket emits the real server message before HTTP response patches it
      // 3) after HTTP response, the optimistic message gets metaMessageId too
      // 4) both entries share the same metaMessageId -> should be deduped.
      m.metaMessageId
        ? `meta:${m.metaMessageId}`
        : m.clientKey
          ? `client:${m.clientKey}`
          : `id:${m.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }

  return out;
}

function mergeMessageLists(
  current: ChatMessage[],
  fetched: ChatMessage[],
): ChatMessage[] {
  const merged = dedupeByIdAndMeta([...current, ...fetched]);
  return merged.sort((a, b) => {
    const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
    const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
    return tb - ta;
  });
}

function mimeFromImageUrl(url: string): { mimeType: string; ext: string } {
  const lower = url.split("?")[0]?.toLowerCase() ?? "";
  if (lower.endsWith(".png")) return { mimeType: "image/png", ext: "png" };
  if (lower.endsWith(".webp")) return { mimeType: "image/webp", ext: "webp" };
  if (lower.endsWith(".gif")) return { mimeType: "image/gif", ext: "gif" };
  return { mimeType: "image/jpeg", ext: "jpg" };
}

function patchOutgoingWithServer(
  existing: ChatMessage,
  server: ChatMessage,
): ChatMessage {
  return {
    ...existing,
    id: server.id,
    metaMessageId: server.metaMessageId ?? existing.metaMessageId,
    type: server.type ?? existing.type,
    text: server.text,
    time: server.time || existing.time,
    timestamp: server.timestamp ?? existing.timestamp,
    status: server.status ?? "sent",
    pending: false,
    mediaId: server.mediaId ?? existing.mediaId,
    mimeType: server.mimeType ?? existing.mimeType,
    caption: server.caption ?? existing.caption,
    mediaUrl: server.mediaUrl ?? existing.mediaUrl,
    clientKey: existing.clientKey,
  };
}

const INITIAL_MESSAGE_LIMIT = 20;
const MESSAGE_PAGE_SIZE = 25;

export default function ChatDetailScreen() {
  const { store } = useStore();
  const { isDark } = useAppTheme();
  const { markChatRead, setActiveChat } = useStoreUnread();
  const {
    onMessageNew,
    onMessageStatus,
    onInstagramMessageNew,
    onInboxAiTyping,
  } = useChatSocket();
  const { pauseRecording } = useChatVoiceRecording();
  const {
    id,
    phone,
    channel: channelParam,
    displayName,
    unread,
    replyMode: replyModeParam,
  } = useLocalSearchParams<{
    id: string;
    phone?: string;
    channel?: string;
    displayName?: string;
    unread?: string;
    replyMode?: string;
  }>();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [actionsMessage, setActionsMessage] = useState<ChatMessage | null>(
    null,
  );
  const [actionsVisible, setActionsVisible] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(
    null,
  );
  const [forwardVisible, setForwardVisible] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [replyMode, setReplyMode] = useState<"ai" | "manual">(
    replyModeParam === "manual" ? "manual" : "ai",
  );
  const [replyModeBusy, setReplyModeBusy] = useState(false);
  const [aiPreparingReply, setAiPreparingReply] = useState(false);
  const aiPreparingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [stickyDateLabel, setStickyDateLabel] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatListItem>>(null);
  const stickToBottomRef = useRef(true);
  const shouldAutoScrollRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const loadGenerationRef = useRef(0);

  const unreadCount = useMemo(() => {
    const raw =
      typeof unread === "string"
        ? unread
        : Array.isArray(unread)
          ? unread[0]
          : "0";
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [unread]);

  const initialLimit = Math.max(INITIAL_MESSAGE_LIMIT, unreadCount);

  const scrollToBottom = useCallback((animated: boolean) => {
    listRef.current?.scrollToOffset({ offset: 0, animated });
  }, []);

  const triggerAutoScroll = useCallback(() => {
    shouldAutoScrollRef.current = true;
    stickToBottomRef.current = true;
    requestAnimationFrame(() => scrollToBottom(true));
  }, [scrollToBottom]);

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

  const chatBoatActive =
    hasPremiumAccess(store) &&
    store?.ai_auto_reply_enabled === true &&
    replyMode === "ai";

  const toggleReplyMode = async (mode: "ai" | "manual") => {
    if (!store?.id) return;
    setReplyModeBusy(true);
    try {
      await setChatReplyMode({
        channel,
        storeId: store.id,
        conversationId,
        replyMode: mode,
      });
      setReplyMode(mode);
      if (mode === "manual") setAiPreparingReply(false);
    } catch (e) {
      showError(e, "Could not update reply mode");
    } finally {
      setReplyModeBusy(false);
    }
  };

  useEffect(() => {
    if (store && !hasPremiumAccess(store)) {
      router.replace("/subscription" as Href);
    }
  }, [store]);

  const title = useMemo(() => {
    if (
      channel === "instagram" &&
      customerPhone &&
      !customerPhone.startsWith("@")
    ) {
      return customerPhone.length > 12
        ? `IG ${customerPhone.slice(0, 8)}…`
        : customerPhone;
    }
    return headerLabel || "Chat";
  }, [channel, customerPhone, headerLabel]);

  const loadMessages = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!store?.id || !Number.isFinite(conversationId)) return;
      const silent = options?.silent ?? false;
      const isInitialLoad = !silent && !initialLoadDoneRef.current;
      const limit = isInitialLoad ? initialLimit : MESSAGE_PAGE_SIZE;
      const generation = ++loadGenerationRef.current;

      if (!silent) {
        setIsLoading(true);
        stickToBottomRef.current = true;
      }
      try {
        const res =
          channel === "instagram"
            ? await fetchInstagramMessages({
                storeId: store.id,
                conversationId,
                limit,
              })
            : await fetchChatMessages({
                storeId: store.id,
                conversationId,
                limit,
              });
        if (generation !== loadGenerationRef.current) return;

        const mapped = res.data.messages.map((m) =>
          mapApiMessageToChatMessage(m, store.id),
        );
        setMessages((prev) => {
          const nextMessages = silent
            ? mergeMessageLists(prev, mapped)
            : mapped;
          return channel === "whatsapp"
            ? prepareWhatsAppMessagesForDisplay(nextMessages)
            : nextMessages;
        });
        setNextCursor(res.data.nextCursor);
        setHasMore(
          res.data.messages.length >= limit && Boolean(res.data.nextCursor),
        );
        if (isInitialLoad) {
          initialLoadDoneRef.current = true;
        }
      } catch (e: unknown) {
        if (!silent) {
          showError(
            "Failed to load messages",
            e instanceof Error ? e.message : "Unknown error",
          );
        }
      } finally {
        if (!silent && generation === loadGenerationRef.current) {
          setIsLoading(false);
        }
      }
    },
    [store?.id, conversationId, channel, initialLimit],
  );

  const loadOlderMessages = useCallback(async () => {
    if (
      !store?.id ||
      !Number.isFinite(conversationId) ||
      !nextCursor ||
      loadingMore ||
      !hasMore
    ) {
      return;
    }

    setLoadingMore(true);
    stickToBottomRef.current = false;

    try {
      const res =
        channel === "instagram"
          ? await fetchInstagramMessages({
              storeId: store.id,
              conversationId,
              limit: MESSAGE_PAGE_SIZE,
              cursor: nextCursor,
            })
          : await fetchChatMessages({
              storeId: store.id,
              conversationId,
              limit: MESSAGE_PAGE_SIZE,
              cursor: nextCursor,
            });

      const older = res.data.messages.map((m) =>
        mapApiMessageToChatMessage(m, store.id),
      );

      setMessages((prev) => {
        const merged = dedupeByIdAndMeta([...prev, ...older]);
        return channel === "whatsapp"
          ? prepareWhatsAppMessagesForDisplay(merged)
          : merged;
      });
      setNextCursor(res.data.nextCursor);
      setHasMore(
        res.data.messages.length >= MESSAGE_PAGE_SIZE &&
          Boolean(res.data.nextCursor),
      );
    } catch (e: unknown) {
      showError(
        "Failed to load older messages",
        e instanceof Error ? e.message : "Unknown error",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [store?.id, conversationId, channel, nextCursor, loadingMore, hasMore]);

  useEffect(() => {
    initialLoadDoneRef.current = false;
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
      scheduleMarkReadRef.current();
      return () => {
        void pauseRecording(conversationId);
        setActiveChat(null);
        if (markReadTimerRef.current) {
          clearTimeout(markReadTimerRef.current);
          markReadTimerRef.current = null;
        }
      };
    }, [conversationId, channel, setActiveChat, pauseRecording]),
  );

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      stickToBottomRef.current = contentOffset.y < 80;
    },
    [],
  );

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
      if (toSocketId(payload.conversationId) !== conversationId || !store?.id)
        return;
      setMessages((prev) => {
        const incoming = mapSocketMessageToChatMessage(
          payload.message,
          store.id,
        );

        // Already have this exact server message? Skip.
        if (
          prev.some(
            (m) =>
              m.id === incoming.id ||
              (incoming.metaMessageId &&
                m.metaMessageId === incoming.metaMessageId &&
                incoming.type !== "reaction"),
          )
        ) {
          return prev;
        }

        // If the socket delivers an outbound message, check for a matching
        // optimistic (pending) entry and patch it in-place instead of
        // appending a duplicate that briefly flickers before dedupe removes it.
        if (incoming.outgoing) {
          const pendingIdx = prev.findIndex(
            (m) => m.pending && m.text === incoming.text && m.outgoing,
          );
          if (pendingIdx !== -1) {
            const patched = patchOutgoingWithServer(prev[pendingIdx], incoming);
            const next = [...prev];
            next[pendingIdx] = patched;
            return channel === "whatsapp"
              ? prepareWhatsAppMessagesForDisplay(next)
              : next;
          }
        }

        const next = dedupeByIdAndMeta([incoming, ...prev]);
        return channel === "whatsapp"
          ? prepareWhatsAppMessagesForDisplay(next)
          : next;
      });
      triggerAutoScroll();
      if (payload.message.direction === "inbound") {
        scheduleMarkReadRef.current();
      }
      if (payload.message.direction === "outbound") {
        setAiPreparingReply(false);
      }
    };

    const unsubWa = onMessageNew(handleNew);
    const unsubIg = onInstagramMessageNew(handleNew);

    const unsubStatus = onMessageStatus((payload) => {
      if (toSocketId(payload.conversationId) !== conversationId) return;
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
  }, [
    conversationId,
    store?.id,
    channel,
    onMessageNew,
    onInstagramMessageNew,
    onMessageStatus,
    triggerAutoScroll,
  ]);

  useEffect(() => {
    if (!Number.isFinite(conversationId) || !store?.id) return;

    const unsub = onInboxAiTyping((payload) => {
      if (payload.storeId !== store.id) return;
      if (toSocketId(payload.conversationId) !== conversationId) return;
      if (payload.channel !== channel) return;

      if (aiPreparingTimeoutRef.current) {
        clearTimeout(aiPreparingTimeoutRef.current);
        aiPreparingTimeoutRef.current = null;
      }

      setAiPreparingReply(payload.typing);
      if (payload.typing) {
        aiPreparingTimeoutRef.current = setTimeout(() => {
          setAiPreparingReply(false);
          aiPreparingTimeoutRef.current = null;
        }, 45_000);
      }
    });

    return () => {
      unsub();
      if (aiPreparingTimeoutRef.current) {
        clearTimeout(aiPreparingTimeoutRef.current);
        aiPreparingTimeoutRef.current = null;
      }
    };
  }, [channel, conversationId, onInboxAiTyping, store?.id]);

  const previewForMediaType = (
    type: OutboundMediaPayload["type"],
    caption?: string,
  ) => {
    if (caption?.trim()) return caption.trim();
    if (type === "image") return "Photo";
    if (type === "video") return "Video";
    return "Voice message";
  };

  const sendOneMediaMessage = async (
    payload: OutboundMediaPayload,
    tempIdOffset = 0,
  ) => {
    const tempId = -(Date.now() + tempIdOffset);
    const clientKey = `client-${tempId}`;
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      {
        id: tempId,
        clientKey,
        type: payload.type,
        text: previewForMediaType(payload.type, payload.caption),
        caption: payload.caption,
        time,
        timestamp: now.toISOString(),
        outgoing: true,
        status: "pending",
        pending: true,
      },
      ...prev,
    ]);
    triggerAutoScroll();

    try {
      const uploaded = await uploadWhatsAppMedia({
        storeId: store!.id,
        kind: payload.type,
        uri: payload.uri,
        name: payload.name,
        type: payload.mimeType,
        voice: payload.voice,
      });

      const res = await sendWhatsAppMediaMessage({
        storeId: store!.id,
        to: customerPhone,
        conversationId,
        type: payload.type,
        mediaId: uploaded.data.media_id,
        mimeType: uploaded.data.mime_type,
        caption: payload.caption,
        voice: payload.voice === true,
      });

      const serverMessage = mapApiMessageToChatMessage(
        res.data.message,
        store!.id,
      );

      setMessages((prev) =>
        dedupeByIdAndMeta(
          prev.map((m) =>
            m.clientKey === clientKey
              ? patchOutgoingWithServer(m, serverMessage)
              : m,
          ),
        ),
      );
    } catch (e: unknown) {
      setMessages((prev) => prev.filter((m) => m.clientKey !== clientKey));
      showError(e, "Failed to send media");
      throw e;
    }
  };

  const sendMediaMessage = async (
    payload: OutboundMediaPayload | OutboundMediaPayload[],
  ) => {
    if (!store?.id || isSending || channel !== "whatsapp") return;

    const payloads = Array.isArray(payload) ? payload : [payload];
    if (!payloads.length) return;

    setIsSending(true);
    try {
      for (let i = 0; i < payloads.length; i++) {
        await sendOneMediaMessage(payloads[i], i);
      }
    } finally {
      setIsSending(false);
    }
  };

  const sendTextMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !store?.id || isSending) return;

      const tempId = -Date.now();
      const clientKey = `client-${tempId}`;
      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        {
          id: tempId,
          clientKey,
          text: trimmed,
          time,
          timestamp: now.toISOString(),
          outgoing: true,
          status: "pending",
          pending: true,
        },
        ...prev,
      ]);
      triggerAutoScroll();
      setIsSending(true);

      try {
        const res = await sendChatMessage({
          storeId: store.id,
          to: customerPhone,
          message: trimmed,
          conversationId,
          channel,
        });

        const serverMessage = mapApiMessageToChatMessage(
          res.data.message,
          store.id,
        );

        setMessages((prev) =>
          dedupeByIdAndMeta(
            prev.map((m) =>
              m.clientKey === clientKey
                ? patchOutgoingWithServer(m, serverMessage)
                : m,
            ),
          ),
        );
      } catch (e: unknown) {
        setMessages((prev) => prev.filter((m) => m.clientKey !== clientKey));
        showError(e, "Failed to send");
        throw e;
      } finally {
        setIsSending(false);
      }
    },
    [
      store?.id,
      isSending,
      customerPhone,
      conversationId,
      channel,
      triggerAutoScroll,
    ],
  );

  const sendProductShare = async (payload: ProductShareSendPayload) => {
    const { text, imageUrl } = payload;
    if (!imageUrl?.trim()) {
      await sendTextMessage(text);
      return;
    }

    const cache = FileSystem.cacheDirectory;
    if (!cache) {
      showError("Could not prepare product image for send");
      return;
    }

    const { mimeType, ext } = mimeFromImageUrl(imageUrl);
    const dest = `${cache}product-share-${Date.now()}.${ext}`;

    try {
      const result = await FileSystem.downloadAsync(imageUrl.trim(), dest);
      await sendMediaMessage({
        type: "image",
        uri: result.uri,
        name: `product-share.${ext}`,
        mimeType,
        caption: text,
      });
    } catch (e: unknown) {
      showError(e, "Failed to send product image");
      throw e;
    }
  };

  const listItems = useMemo(
    () => injectChatDateSeparators(messages),
    [messages],
  );

  useEffect(() => {
    setStickyDateLabel(dateLabelFromTimestamp(messages[0]?.timestamp ?? null));
  }, [messages]);

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: { index: number | null; item: ChatListItem }[];
    }) => {
      const label = stickyDateLabelFromViewableItems(viewableItems);
      if (label) setStickyDateLabel(label);
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 5,
  }).current;

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
    if (!text) return;
    setDraft("");
    try {
      await sendTextMessage(text);
    } catch {
      setDraft(text);
    }
  };

  return (
    <ChatVoicePlayerProvider>
      <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
        <View
          className={`flex-row items-center px-3 py-3 gap-2.5 ${isDark ? "bg-charcoal" : "bg-brand-primary"}`}
        >
          <Pressable className="p-1" onPress={goBackToChats} hitSlop={12}>
            <FontAwesome
              name="chevron-left"
              size={18}
              color={isDark ? "#FFFFFF" : Colors.brand.onPrimary}
            />
          </Pressable>
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: channel === "instagram" ? "#E1306C" : "#25D366",
            }}
          >
            <FontAwesome
              name={channel === "instagram" ? "instagram" : "whatsapp"}
              size={18}
              color="#FFFFFF"
            />
          </View>
          <View className="flex-1 min-w-0">
            <Text
              className={
                isDark
                  ? "text-white text-base font-bold"
                  : "text-brand-on-primary text-base font-bold"
              }
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

        {chatBoatActive ? (
          <View className="flex-row items-center justify-between px-3 py-2 bg-emerald-50 border-b border-emerald-100">
            <View className="flex-row items-center gap-2 flex-1 min-w-0">
              <FontAwesome
                name="magic"
                size={14}
                color={Colors.brand.primary}
              />
              <Text
                className="text-sm text-emerald-900 font-medium flex-1"
                numberOfLines={1}
              >
                Chat Boat is replying automatically
              </Text>
            </View>
            <Pressable
              className="px-3 py-1.5 rounded-full bg-surface border border-emerald-200"
              disabled={replyModeBusy}
              onPress={() => void toggleReplyMode("manual")}
            >
              <Text
                className={
                  isDark
                    ? "text-xs font-semibold text-emerald-50"
                    : "text-xs font-semibold text-emerald-800"
                }
              >
                Take over
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!chatBoatActive &&
        store?.ai_auto_reply_enabled &&
        replyMode === "manual" &&
        hasPremiumAccess(store) ? (
          <View className="flex-row items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <Text className="text-sm text-gray-600 flex-1">
              You are replying manually
            </Text>
            <Pressable
              className="px-3 py-1.5 rounded-full bg-brand-primary"
              disabled={replyModeBusy}
              onPress={() => void toggleReplyMode("ai")}
            >
              <Text className="text-xs font-semibold text-brand-on-primary">
                Resume AI
              </Text>
            </Pressable>
          </View>
        ) : null}

        <SupportKeyboardChatLayout
          listRef={listRef}
          onKeyboardShow={() => scrollToBottom(true)}
          footer={
            chatBoatActive && aiPreparingReply ? (
              <View className="flex-row items-center gap-2 px-4 py-2">
                <ActivityIndicator size="small" color={Colors.brand.primary} />
                <Muted className="text-[13px]">AI is preparing a reply…</Muted>
              </View>
            ) : null
          }
          composer={
            <ChatComposer
              conversationId={conversationId}
              draft={draft}
              onChangeDraft={setDraft}
              onSendText={() => void sendMessage()}
              onSendMedia={sendMediaMessage}
              onOpenProductPicker={
                channel === "whatsapp" && store?.slug
                  ? () => setProductPickerOpen(true)
                  : undefined
              }
              disabled={isSending}
              channel={channel}
            />
          }
        >
          <View className="flex-1 relative">
            {stickyDateLabel ? (
              <View
                className="absolute top-0 left-0 right-0 z-20 items-center pt-2 pointer-events-none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <ChatDateSeparator label={stickyDateLabel} variant="sticky" />
              </View>
            ) : null}
            {loadingMore ? (
              <View className="absolute top-0 left-0 right-0 z-10 py-2 items-center">
                <ActivityIndicator color={Colors.brand.primary} size="small" />
              </View>
            ) : null}
            <FlatList
              ref={listRef}
              inverted
              data={listItems}
              keyExtractor={(item) =>
                isDateSeparatorItem(item)
                  ? item.id
                  : (item.clientKey ?? String(item.id))
              }
              renderItem={({ item }) =>
                isDateSeparatorItem(item) ? (
                  <ChatDateSeparator label={item.label} />
                ) : (
                  <MessageBubble
                    message={item}
                    storeId={store?.id}
                    onLongPress={(message) => {
                      if (channel !== "whatsapp") return;
                      setActionsMessage(message);
                      setActionsVisible(true);
                    }}
                    onForward={(message) => {
                      if (channel !== "whatsapp") return;
                      setForwardMessage(message);
                      setForwardVisible(true);
                    }}
                  />
                )
              }
              contentContainerStyle={{
                paddingTop: 12,
                paddingHorizontal: 16,
                paddingBottom: stickyDateLabel ? 40 : 8,
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              onScroll={handleListScroll}
              scrollEventThrottle={16}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              onEndReached={() => void loadOlderMessages()}
              onEndReachedThreshold={0.2}
              onContentSizeChange={() => {
                if (stickToBottomRef.current && shouldAutoScrollRef.current) {
                  scrollToBottom(false);
                  shouldAutoScrollRef.current = false;
                }
              }}
            />
          </View>
        </SupportKeyboardChatLayout>

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

        {store?.id && store.slug ? (
          <ChatProductSendModal
            visible={productPickerOpen}
            storeId={store.id}
            storeSlug={store.slug}
            currency={store.currency}
            onClose={() => setProductPickerOpen(false)}
            onSend={(payload) => void sendProductShare(payload)}
          />
        ) : null}
      </SafeAreaView>
    </ChatVoicePlayerProvider>
  );
}
