import { ConversationRow } from "@/components/chat/ConversationRow";
import { PlatformAdminSupportBanner } from "@/components/support/PlatformAdminSupportBanner";
import { ChatsSubscriptionGate } from "@/components/subscription/ChatsSubscriptionGate";
import { AppPressable } from "@/components/ui/AppPressable";
import { Fab } from "@/components/ui/Fab";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchAllChats, messagePreviewText } from "@src/api/chats";
import { useChatSocket } from "@src/contexts/chat-socket-context";
import { useStore } from "@src/contexts/store-context";
import { useStoreUnread } from "@src/contexts/store-unread-context";
import { useStoreTabRootBack } from "@src/hooks/useStoreTabRootBack";
import { usePlatformAdmin } from "@src/hooks/usePlatformAdmin";
import { showError } from "@src/lib/toast";
import { hasPremiumAccess } from "@src/lib/subscription";
import { isAiPaused } from "@src/lib/inbox-ai";
import Colors from "@src/theme/colors";
import type { ChatChannel, ChatListItem } from "@src/types/chat";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

function initialsFromLabel(label: string, fallback: string) {
  const cleaned = label.replace(/^@/, "").trim();
  if (!cleaned) return fallback;
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return (cleaned.slice(0, 2) || fallback).toUpperCase();
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWaPhone(phone: string): string {
  const trimmed = phone.trim()
  if (!trimmed) return phone
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`
}

function mapWhatsAppConversation(c: {
  id: number;
  customer_wa_number: string;
  customer_name?: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count?: number;
  reply_mode?: 'ai' | 'manual';
  ai_paused_until?: string | null;
}): ChatListItem {
  const phone = c.customer_wa_number;
  const name = c.customer_name?.trim();
  const title = name || formatWaPhone(phone);
  return {
    id: c.id,
    channel: "whatsapp",
    title,
    subtitle: c.last_message_preview ?? "—",
    time: formatTime(c.last_message_at),
    sortAt: c.last_message_at,
    unread: c.unread_count ?? 0,
    online: false,
    phone,
    initials: initialsFromLabel(title, "WA"),
    replyMode: c.reply_mode ?? 'ai',
    aiPausedUntil: c.ai_paused_until ?? null,
  };
}

function mapInstagramConversation(c: {
  id: number;
  customer_ig_id: string;
  customer_ig_username: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count?: number;
  reply_mode?: 'ai' | 'manual';
  ai_paused_until?: string | null;
}): ChatListItem {
  const title = c.customer_ig_username
    ? `@${c.customer_ig_username}`
    : c.customer_ig_id;
  return {
    id: c.id,
    channel: "instagram",
    title,
    subtitle: c.last_message_preview ?? "—",
    time: formatTime(c.last_message_at),
    sortAt: c.last_message_at,
    unread: c.unread_count ?? 0,
    online: false,
    phone: c.customer_ig_id,
    initials: initialsFromLabel(title, "IG"),
    replyMode: c.reply_mode ?? 'ai',
    aiPausedUntil: c.ai_paused_until ?? null,
  };
}

function sortConversations(items: ChatListItem[]): ChatListItem[] {
  return [...items].sort((a, b) => {
    const ta = a.sortAt ? Date.parse(a.sortAt) : 0;
    const tb = b.sortAt ? Date.parse(b.sortAt) : 0;
    return tb - ta;
  });
}

function findConversation(
  items: ChatListItem[],
  channel: ChatChannel,
  id: number,
): ChatListItem | undefined {
  return items.find((item) => item.channel === channel && item.id === id);
}

function mergeChatLists(current: ChatListItem[], fetched: ChatListItem[]): ChatListItem[] {
  const map = new Map<string, ChatListItem>()
  for (const item of current) {
    map.set(`${item.channel}:${item.id}`, item)
  }
  for (const item of fetched) {
    const key = `${item.channel}:${item.id}`
    const prev = map.get(key)
    if (!prev) {
      map.set(key, item)
      continue
    }
    const prevTs = prev.sortAt ? Date.parse(prev.sortAt) : 0
    const nextTs = item.sortAt ? Date.parse(item.sortAt) : 0
    map.set(key, {
      ...prev,
      ...item,
      title: item.title || prev.title,
      replyMode: item.replyMode ?? prev.replyMode,
      aiPausedUntil: item.aiPausedUntil ?? prev.aiPausedUntil,
      ...(prevTs > nextTs
        ? { subtitle: prev.subtitle, time: prev.time, sortAt: prev.sortAt, unread: prev.unread }
        : {}),
    })
  }
  return sortConversations(Array.from(map.values()))
}

function resolveListUnread(input: {
  isActive: boolean
  payloadUnread: number | undefined
  existingUnread: number | undefined
}): number {
  if (input.isActive) return 0
  const payload = input.payloadUnread
  const existing = input.existingUnread ?? 0
  // Don't trust a zero from non-active conversation updates when we already
  // have a local unread (e.g. late outbound emit / stale mark-read).
  if (payload === 0 && existing > 0) return existing
  return payload ?? existing
}

function upsertWhatsAppFromConversation(
  prev: ChatListItem[],
  payload: {
    conversation: {
      id: number
      customer_wa_number: string
      last_message_at: string | null
      last_message_preview: string | null
      unread_count: number
      reply_mode?: 'ai' | 'manual'
      ai_paused_until?: string | null
    }
  },
  isActiveChat: (conversationId: number, channel: ChatChannel) => boolean,
): ChatListItem[] {
  const existing = findConversation(prev, "whatsapp", payload.conversation.id)
  const title = existing?.title ?? formatWaPhone(payload.conversation.customer_wa_number)
  const updated: ChatListItem = {
    id: payload.conversation.id,
    channel: "whatsapp",
    title,
    subtitle: payload.conversation.last_message_preview ?? existing?.subtitle ?? "—",
    time: formatTime(payload.conversation.last_message_at),
    sortAt: payload.conversation.last_message_at,
    unread: resolveListUnread({
      isActive: isActiveChat(payload.conversation.id, "whatsapp"),
      payloadUnread: payload.conversation.unread_count,
      existingUnread: existing?.unread,
    }),
    online: existing?.online ?? false,
    phone: payload.conversation.customer_wa_number,
    initials: existing?.initials ?? initialsFromLabel(title, "WA"),
    replyMode:
      payload.conversation.reply_mode ?? existing?.replyMode ?? "ai",
    aiPausedUntil:
      payload.conversation.ai_paused_until !== undefined
        ? payload.conversation.ai_paused_until
        : (existing?.aiPausedUntil ?? null),
  }
  return sortConversations([updated, ...withoutConversation(prev, "whatsapp", updated.id)])
}

function upsertInstagramFromConversation(
  prev: ChatListItem[],
  payload: {
    conversation: {
      id: number
      customer_ig_id: string
      customer_ig_username: string | null
      last_message_at: string | null
      last_message_preview: string | null
      unread_count: number
      reply_mode?: 'ai' | 'manual'
      ai_paused_until?: string | null
    }
  },
  isActiveChat: (conversationId: number, channel: ChatChannel) => boolean,
): ChatListItem[] {
  const existing = findConversation(prev, "instagram", payload.conversation.id)
  const title = payload.conversation.customer_ig_username
    ? `@${payload.conversation.customer_ig_username}`
    : existing?.title ?? payload.conversation.customer_ig_id
  const updated: ChatListItem = {
    id: payload.conversation.id,
    channel: "instagram",
    title,
    subtitle: payload.conversation.last_message_preview ?? existing?.subtitle ?? "—",
    time: formatTime(payload.conversation.last_message_at),
    sortAt: payload.conversation.last_message_at,
    unread: resolveListUnread({
      isActive: isActiveChat(payload.conversation.id, "instagram"),
      payloadUnread: payload.conversation.unread_count,
      existingUnread: existing?.unread,
    }),
    online: existing?.online ?? false,
    phone: payload.conversation.customer_ig_id,
    initials: existing?.initials ?? initialsFromLabel(title, "IG"),
    replyMode:
      payload.conversation.reply_mode ?? existing?.replyMode ?? "ai",
    aiPausedUntil:
      payload.conversation.ai_paused_until !== undefined
        ? payload.conversation.ai_paused_until
        : (existing?.aiPausedUntil ?? null),
  }
  return sortConversations([updated, ...withoutConversation(prev, "instagram", updated.id)])
}

function upsertWhatsAppFromMessage(
  prev: ChatListItem[],
  payload: {
    conversationId: number
    message: {
      direction: string
      timestamp: string | null
      type: string
      text_body: string | null
      caption?: string | null
    }
  },
  isActiveChat: (conversationId: number, channel: ChatChannel) => boolean,
): ChatListItem[] {
  const existing = findConversation(prev, "whatsapp", payload.conversationId)
  const sortAt = payload.message.timestamp
  const isInbound = payload.message.direction === "inbound"
  const updated: ChatListItem = existing
    ? {
        ...existing,
        subtitle: messagePreviewText(payload.message),
        time: formatTime(sortAt),
        sortAt,
        unread: isInbound
          ? isActiveChat(payload.conversationId, "whatsapp")
            ? 0
            : existing.unread + 1
          : existing.unread,
      }
    : {
        id: payload.conversationId,
        channel: "whatsapp",
        title: "WhatsApp",
        subtitle: messagePreviewText(payload.message),
        time: formatTime(sortAt),
        sortAt,
        unread: isInbound && !isActiveChat(payload.conversationId, "whatsapp") ? 1 : 0,
        online: false,
        phone: "",
        initials: "WA",
        replyMode: "ai",
      }
  return sortConversations([updated, ...withoutConversation(prev, "whatsapp", updated.id)])
}

function withoutConversation(
  items: ChatListItem[],
  channel: ChatChannel,
  id: number,
): ChatListItem[] {
  return items.filter((item) => !(item.channel === channel && item.id === id));
}

type LoadChatsOptions = {
  refresh?: boolean;
  silent?: boolean;
};

export default function MessagesListScreen() {
  useStoreTabRootBack("chats");

  const { store } = useStore();
  const premium = hasPremiumAccess(store);
  const { isPlatformAdmin } = usePlatformAdmin();
  const {
    syncChatsUnread,
    isActiveChat,
    supportUnreadCount,
  } = useStoreUnread();
  const {
    onConversationUpdated,
    onMessageNew,
    onInstagramConversationUpdated,
    onInstagramMessageNew,
  } = useChatSocket();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsLengthRef = useRef(0);
  const loadGenerationRef = useRef(0);

  const loadChats = useCallback(
    async (options?: boolean | LoadChatsOptions) => {
      if (!store?.id) return;

      const opts: LoadChatsOptions =
        typeof options === "boolean" ? { refresh: options } : (options ?? {});
      const { refresh = false, silent = false } = opts;
      const generation = ++loadGenerationRef.current;

      if (refresh) setIsRefreshing(true);
      else if (!silent) setIsLoading(true);

      try {
        const { whatsapp, instagram } = await fetchAllChats(store.id);
        if (generation !== loadGenerationRef.current) return;

        const mergedFromApi = sortConversations([
          ...whatsapp.map(mapWhatsAppConversation),
          ...instagram.map(mapInstagramConversation),
        ])
        setItems((prev) => {
          const merged = silent ? mergeChatLists(prev, mergedFromApi) : mergedFromApi
          return merged.map((item) =>
            isActiveChat(item.id, item.channel) ? { ...item, unread: 0 } : item,
          )
        })
      } catch (e: unknown) {
        showError(
          "Failed to load chats",
          e instanceof Error ? e.message : "Unknown error",
        );
      } finally {
        if (generation === loadGenerationRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [store?.id, isActiveChat],
  );

  useEffect(() => {
    itemsLengthRef.current = items.length;
  }, [items.length]);

  useFocusEffect(
    useCallback(() => {
      void loadChats({ silent: itemsLengthRef.current > 0 });
    }, [loadChats]),
  );

  useEffect(() => {
    syncChatsUnread(items);
  }, [items, syncChatsUnread]);

  useEffect(() => {
    const unsubWaConversation = onConversationUpdated((payload) => {
      setItems((prev) => upsertWhatsAppFromConversation(prev, payload, isActiveChat))
    })

    const unsubWaMessage = onMessageNew((payload) => {
      setItems((prev) => upsertWhatsAppFromMessage(prev, payload, isActiveChat))
    })

    const unsubIgConversation = onInstagramConversationUpdated((payload) => {
      setItems((prev) => upsertInstagramFromConversation(prev, payload, isActiveChat))
    })

    const unsubIgMessage = onInstagramMessageNew((payload) => {
      setItems((prev) => {
        const existing = findConversation(prev, "instagram", payload.conversationId)
        const sortAt = payload.message.timestamp
        const isInbound = payload.message.direction === "inbound"
        const updated: ChatListItem = existing
          ? {
              ...existing,
              subtitle: messagePreviewText(payload.message),
              time: formatTime(sortAt),
              sortAt,
              unread: isInbound
                ? isActiveChat(payload.conversationId, "instagram")
                  ? 0
                  : existing.unread + 1
                : existing.unread,
            }
          : {
              id: payload.conversationId,
              channel: "instagram",
              title: "Instagram",
              subtitle: messagePreviewText(payload.message),
              time: formatTime(sortAt),
              sortAt,
              unread: isInbound && !isActiveChat(payload.conversationId, "instagram") ? 1 : 0,
              online: false,
              phone: "",
              initials: "IG",
              replyMode: "ai",
            }
        return sortConversations([updated, ...withoutConversation(prev, "instagram", updated.id)])
      })
    })

    return () => {
      unsubWaConversation()
      unsubWaMessage()
      unsubIgConversation()
      unsubIgMessage()
    }
  }, [
    onConversationUpdated,
    onMessageNew,
    onInstagramConversationUpdated,
    onInstagramMessageNew,
    isActiveChat,
  ]);

  const conversations = useMemo(() => {
    let list = items;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.subtitle.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, search]);

  const headerSubtitle = useMemo(() => {
    if (!store?.id) return "Connect your store to view messages";
    if (isLoading && items.length === 0) return "Loading conversations…";
    const n = items.length;
    if (n === 0) return "WhatsApp and Instagram conversations";
    return `${n} Conversation${n === 1 ? "" : "s"}`;
  }, [store?.id, isLoading, items.length]);

  return (
    <Screen>
      <ScreenHeader
        showLogo
        variant="tab"
        title="Messages"
        subtitle={headerSubtitle}
        right={
          <AppPressable
            hitSlop={12}
            onPress={() => void loadChats({ refresh: true })}
            accessibilityLabel="Refresh conversations"
            containerClassName="w-10 h-10 rounded-full border border-gray-200 bg-surface items-center justify-center"
          >
            <FontAwesome
              name="refresh"
              size={16}
              color={Colors.brand.primary}
            />
          </AppPressable>
        }
      />

      <ScreenBody className="flex-1">
        {isPlatformAdmin ? (
          <View className="px-4 pt-2">
            <PlatformAdminSupportBanner />
          </View>
        ) : null}
        {!premium && store?.id ? (
          <ChatsSubscriptionGate
            onViewPlans={() => router.push("/subscription" as Href)}
          />
        ) : (
          <>
        <SearchBar
          placeholder="Search conversations…"
          value={search}
          onChangeText={setSearch}
          className="mt-1 mb-2"
        />

        <FlatList
          data={conversations}
          extraData={items}
          keyExtractor={(item) => `${item.channel}:${item.id}`}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadChats({ refresh: true })}
            />
          }
          renderItem={({ item }) => (
            <ConversationRow
              conversation={{
                ...item,
                aiHandling:
                  hasPremiumAccess(store) &&
                  store?.ai_auto_reply_enabled === true &&
                  item.replyMode === 'ai' &&
                  !isAiPaused(item.aiPausedUntil),
              }}
              onPress={() =>
                router.push({
                  pathname: `/(store)/chats/${item.id}`,
                  params: {
                    phone: item.phone,
                    channel: item.channel,
                    displayName: item.title,
                    unread: String(item.unread),
                    replyMode: item.replyMode ?? 'ai',
                    aiPausedUntil: item.aiPausedUntil ?? '',
                  },
                } as unknown as Href)
              }
            />
          )}
          ListEmptyComponent={
            store?.id ? (
              <View className="p-10 items-center">
                <Muted>
                  {isLoading
                    ? "Loading conversations…"
                    : "No conversations found"}
                </Muted>
              </View>
            ) : (
              <EmptyState
                icon="comments"
                title="No store yet"
                description="Create a store to view messages."
              />
            )
          }
          className="flex-1 bg-surface"
          contentContainerClassName="pb-32"
          showsVerticalScrollIndicator={false}
        />
          </>
        )}

        <Fab
          variant="brand"
          badgeCount={supportUnreadCount}
          accessibilityLabel="Chat with AI"
          onPress={() => router.push("/(store)/chats/support-ai" as Href)}
        >
          <FontAwesome
            name="comments"
            size={22}
            color={Colors.brand.onPrimary}
          />
        </Fab>
      </ScreenBody>
    </Screen>
  );
}
