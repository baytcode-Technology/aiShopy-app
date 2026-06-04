import { ConversationRow } from "@/components/chat/ConversationRow";
import { AppPressable } from "@/components/ui/AppPressable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchChats } from "@src/api/chats";
import { useChatSocket } from "@src/contexts/chat-socket-context";
import { useStore } from "@src/contexts/store-context";
import { showError } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import type { ChatListItem } from "@src/types/chat";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

function initialsFromPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const last2 = digits.slice(-2);
  return (last2 || "WA").toUpperCase();
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapConversation(c: {
  id: string;
  customer_wa_number: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count?: number;
}): ChatListItem {
  const phone = c.customer_wa_number;
  return {
    id: c.id,
    title: phone,
    subtitle: c.last_message_preview ?? "—",
    time: formatTime(c.last_message_at),
    unread: c.unread_count ?? 0,
    online: false,
    phone,
    initials: initialsFromPhone(phone),
  };
}

export default function MessagesListScreen() {
  const { store } = useStore();
  const { onConversationUpdated, onMessageNew } = useChatSocket();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadChats = useCallback(
    async (refresh = false) => {
      if (!store?.id) return;
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const res = await fetchChats(store.id);
        setItems(res.data.chats.map(mapConversation));
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
    [store?.id],
  );

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  useEffect(() => {
    const unsubConversation = onConversationUpdated((payload) => {
      setItems((prev) => {
        const next = mapConversation(payload.conversation);
        const without = prev.filter((item) => item.id !== next.id);
        return [next, ...without];
      });
    });

    const unsubMessage = onMessageNew((payload) => {
      setItems((prev) => {
        const existing = prev.find(
          (item) => item.id === payload.conversationId,
        );
        if (!existing) {
          void loadChats(true);
          return prev;
        }

        const time = formatTime(payload.message.timestamp);
        const updated: ChatListItem = {
          ...existing,
          subtitle: payload.message.text_body ?? `[${payload.message.type}]`,
          time,
          unread:
            payload.message.direction === "inbound"
              ? existing.unread + 1
              : existing.unread,
        };

        return [updated, ...prev.filter((item) => item.id !== updated.id)];
      });
    });

    return () => {
      unsubConversation();
      unsubMessage();
    };
  }, [onConversationUpdated, onMessageNew, loadChats]);

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
    if (!store?.id) return "Connect your store to view WhatsApp chats";
    if (isLoading && items.length === 0) return "Loading conversations…";
    const n = items.length;
    if (n === 0) return "Conversations with customers";
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
            onPress={() => void loadChats(true)}
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
        <SearchBar
          placeholder="Search conversations…"
          value={search}
          onChangeText={setSearch}
          className="mt-1 mb-2"
        />

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadChats(true)}
            />
          }
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() =>
                router.push({
                  pathname: `/(store)/chats/${item.id}`,
                  params: { phone: item.phone },
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
                description="Create a store to view WhatsApp messages."
              />
            )
          }
          className="flex-1 bg-surface"
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
        />
      </ScreenBody>
    </Screen>
  );
}
