import { ConversationRow } from "@/components/chat/ConversationRow";
import { ChatsSubscriptionGate } from "@/components/subscription/ChatsSubscriptionGate";
import { AppPressable } from "@/components/ui/AppPressable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchAllChats } from "@src/api/chats";
import { useChatSocket } from "@src/contexts/chat-socket-context";
import { useStore } from "@src/contexts/store-context";
import { useStoreUnread } from "@src/contexts/store-unread-context";
import { useStoreTabRootBack } from "@src/hooks/useStoreTabRootBack";
import { showError } from "@src/lib/toast";
import { hasPremiumAccess } from "@src/lib/subscription";
import Colors from "@src/theme/colors";
import type { ChatListItem } from "@src/types/chat";
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

function mapWhatsAppConversation(c: {
  id: string;
  customer_wa_number: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count?: number;
}): ChatListItem {
  const phone = c.customer_wa_number;
  return {
    id: c.id,
    channel: "whatsapp",
    title: phone,
    subtitle: c.last_message_preview ?? "—",
    time: formatTime(c.last_message_at),
    sortAt: c.last_message_at,
    unread: c.unread_count ?? 0,
    online: false,
    phone,
    initials: initialsFromLabel(phone, "WA"),
  };
}

function mapInstagramConversation(c: {
  id: string;
  customer_ig_id: string;
  customer_ig_username: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count?: number;
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
  };
}

function sortConversations(items: ChatListItem[]): ChatListItem[] {
  return [...items].sort((a, b) => {
    const ta = a.sortAt ? Date.parse(a.sortAt) : 0;
    const tb = b.sortAt ? Date.parse(b.sortAt) : 0;
    return tb - ta;
  });
}

type LoadChatsOptions = {
  refresh?: boolean;
  silent?: boolean;
};

export default function MessagesListScreen() {
  useStoreTabRootBack("chats");

  const { store } = useStore();
  const premium = hasPremiumAccess(store);
  const { syncChatsUnread, onChatsInvalidate, isActiveChat } = useStoreUnread();
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

  const loadChats = useCallback(
    async (options?: boolean | LoadChatsOptions) => {
      if (!store?.id) return;

      const opts: LoadChatsOptions =
        typeof options === "boolean" ? { refresh: options } : (options ?? {});
      const { refresh = false, silent = false } = opts;

      if (refresh) setIsRefreshing(true);
      else if (!silent) setIsLoading(true);

      try {
        const { whatsapp, instagram } = await fetchAllChats(store.id);
        const merged = sortConversations([
          ...whatsapp.map(mapWhatsAppConversation),
          ...instagram.map(mapInstagramConversation),
        ]).map((item) =>
          isActiveChat(item.id) ? { ...item, unread: 0 } : item,
        );
        setItems(merged);
      } catch (e: unknown) {
        showError(
          "Failed to load chats",
          e instanceof Error ? e.message : "Unknown error",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
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
    return onChatsInvalidate(() => {
      void loadChats({ silent: true });
    });
  }, [onChatsInvalidate, loadChats]);

  useEffect(() => {
    const unsubWaConversation = onConversationUpdated((payload) => {
      setItems((prev) => {
        const next = mapWhatsAppConversation(payload.conversation);
        if (isActiveChat(next.id)) {
          next.unread = 0;
        }
        const without = prev.filter((item) => item.id !== next.id);
        return sortConversations([next, ...without]);
      });
    });

    const unsubWaMessage = onMessageNew((payload) => {
      setItems((prev) => {
        const existing = prev.find(
          (item) => item.id === payload.conversationId,
        );
        if (!existing) {
          void loadChats({ silent: true });
          return prev;
        }

        const sortAt = payload.message.timestamp;
        const time = formatTime(sortAt);
        const isInbound = payload.message.direction === "inbound";
        const updated: ChatListItem = {
          ...existing,
          subtitle: payload.message.text_body ?? `[${payload.message.type}]`,
          time,
          sortAt,
          unread: isInbound
            ? isActiveChat(payload.conversationId)
              ? 0
              : existing.unread + 1
            : existing.unread,
        };

        return sortConversations([
          updated,
          ...prev.filter((item) => item.id !== updated.id),
        ]);
      });
    });

    const unsubIgConversation = onInstagramConversationUpdated((payload) => {
      setItems((prev) => {
        const next = mapInstagramConversation(payload.conversation);
        if (isActiveChat(next.id)) {
          next.unread = 0;
        }
        const without = prev.filter((item) => item.id !== next.id);
        return sortConversations([next, ...without]);
      });
    });

    const unsubIgMessage = onInstagramMessageNew((payload) => {
      setItems((prev) => {
        const existing = prev.find(
          (item) => item.id === payload.conversationId,
        );
        if (!existing) {
          void loadChats({ silent: true });
          return prev;
        }

        const sortAt = payload.message.timestamp;
        const time = formatTime(sortAt);
        const isInbound = payload.message.direction === "inbound";
        const updated: ChatListItem = {
          ...existing,
          subtitle: payload.message.text_body ?? `[${payload.message.type}]`,
          time,
          sortAt,
          unread: isInbound
            ? isActiveChat(payload.conversationId)
              ? 0
              : existing.unread + 1
            : existing.unread,
        };

        return sortConversations([
          updated,
          ...prev.filter((item) => item.id !== updated.id),
        ]);
      });
    });

    return () => {
      unsubWaConversation();
      unsubWaMessage();
      unsubIgConversation();
      unsubIgMessage();
    };
  }, [
    onConversationUpdated,
    onMessageNew,
    onInstagramConversationUpdated,
    onInstagramMessageNew,
    loadChats,
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
          keyExtractor={(item) => `${item.channel}:${item.id}`}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadChats({ refresh: true })}
            />
          }
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() =>
                router.push({
                  pathname: `/(store)/chats/${item.id}`,
                  params: { phone: item.phone, channel: item.channel },
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
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
        />
          </>
        )}
      </ScreenBody>
    </Screen>
  );
}
