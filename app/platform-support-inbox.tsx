import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Muted } from "@/components/ui/Typography";
import { UnreadCountBadge } from "@/components/ui/UnreadCountBadge";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchSupportAdminConversations } from "@src/api/support";
import { usePlatformAdminBack } from "@src/hooks/usePlatformAdminBack";
import { showError } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import { palette } from "@src/theme/palette";
import type { SupportAdminConversation } from "@src/types/support";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

type InboxFilter = "tickets" | "ai" | "all";

function isOpenTicket(item: SupportAdminConversation) {
  return item.status === "escalated";
}

function isAiChat(item: SupportAdminConversation) {
  return item.status === "active";
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

function ConversationAdminRow({
  item,
  onPress,
}: {
  item: SupportAdminConversation;
  onPress: () => void;
}) {
  const isEscalated = item.status === "escalated";
  const isManual = item.reply_mode === "manual";

  return (
    <Pressable
      onPress={onPress}
      className="px-5 py-4 border-b border-gray-100 bg-surface"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 min-w-0">
          <Text
            className="text-[15px] font-semibold text-ink"
            numberOfLines={1}
          >
            {item.store_name}
          </Text>
          <Muted className="text-[13px] mt-0.5" numberOfLines={1}>
            {item.owner_email ?? "Unknown owner"}
          </Muted>
          <Muted className="text-[13px] mt-2 leading-5" numberOfLines={2}>
            {item.last_message_preview ?? "No messages yet"}
          </Muted>
        </View>
        <View className="items-end gap-1.5">
          <Caption className="text-gray-400">
            {formatRelative(item.last_message_at)}
          </Caption>
          {isEscalated ? (
            <View className="rounded-full bg-[#E8F8EC] px-2 py-0.5">
              <Caption className="text-brand-green text-[10px] font-bold uppercase">
                {isManual ? "Manual" : "Open"}
              </Caption>
            </View>
          ) : (
            <View className="rounded-full bg-gray-100 px-2 py-0.5">
              <Caption className="text-gray-600 text-[10px] font-bold uppercase">
                AI
              </Caption>
            </View>
          )}
          {isEscalated && item.ticket_code ? (
            <Caption className="text-gray-400 text-[10px]">
              {item.ticket_code}
            </Caption>
          ) : null}
          {(item.unread_count ?? 0) > 0 ? (
            <UnreadCountBadge count={item.unread_count ?? 0} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function InboxFilterBar({
  filter,
  onChange,
  ticketCount,
  aiCount,
  allCount,
}: {
  filter: InboxFilter;
  onChange: (next: InboxFilter) => void;
  ticketCount: number;
  aiCount: number;
  allCount: number;
}) {
  const tabs: { id: InboxFilter; label: string; count: number }[] = [
    { id: "tickets", label: "Tickets", count: ticketCount },
    { id: "ai", label: "AI", count: aiCount },
    { id: "all", label: "All", count: allCount },
  ];

  return (
    <View className="px-4 py-3">
      <View style={filterStyles.track}>
        {tabs.map((tab) => {
          const selected = filter === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onChange(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${tab.label} filter`}
              style={[filterStyles.tab, selected && filterStyles.tabSelected]}
            >
              <Text style={filterStyles.label}>{tab.label}</Text>
              <Text
                style={[
                  filterStyles.count,
                  !selected && filterStyles.countMuted,
                ]}
              >
                {tab.count}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const filterStyles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.gray200,
    backgroundColor: palette.gray100,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  tabSelected: {
    backgroundColor: palette.surface,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.ink,
  },
  count: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.ink,
    marginLeft: 6,
  },
  countMuted: {
    color: palette.gray500,
  },
});

export default function PlatformSupportInboxScreen() {
  const goBack = usePlatformAdminBack();
  const [items, setItems] = useState<SupportAdminConversation[]>([]);
  const [filter, setFilter] = useState<InboxFilter>("tickets");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await fetchSupportAdminConversations();
      setItems(res.data.conversations);
    } catch (e: unknown) {
      showError(e, "Failed to load support inbox");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const ticketItems = useMemo(
    () => items.filter((item) => isOpenTicket(item)),
    [items],
  );
  const aiItems = useMemo(
    () => items.filter((item) => isAiChat(item)),
    [items],
  );

  const filtered = useMemo(() => {
    if (filter === "tickets") return ticketItems;
    if (filter === "ai") return aiItems;
    return items;
  }, [filter, items, ticketItems, aiItems]);

  const unreadTotal = useMemo(
    () => ticketItems.reduce((sum, item) => sum + (item.unread_count ?? 0), 0),
    [ticketItems],
  );

  const emptyMessage = isLoading
    ? "Loading conversations…"
    : filter === "tickets"
      ? "No open tickets right now"
      : filter === "ai"
        ? "No AI chats right now"
        : "No support conversations right now";

  return (
    <Screen>
      <ScreenHeader
        title="Support inbox"
        subtitle={
          unreadTotal > 0
            ? `${unreadTotal} unread on open tickets`
            : `${ticketItems.length} open · ${aiItems.length} AI chats`
        }
        onBack={goBack}
      />
      <ScreenBody className="flex-1">
        <InboxFilterBar
          filter={filter}
          onChange={setFilter}
          ticketCount={ticketItems.length}
          aiCount={aiItems.length}
          allCount={items.length}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void load(true)}
            />
          }
          renderItem={({ item }) => (
            <ConversationAdminRow
              item={item}
              onPress={() =>
                router.push(`/platform-support/${item.id}` as Href)
              }
            />
          )}
          ListEmptyComponent={
            <View className="p-10 items-center">
              <FontAwesome name="inbox" size={28} color={Colors.text.muted} />
              <Muted className="mt-3 text-center">{emptyMessage}</Muted>
            </View>
          }
          className="flex-1 bg-surface"
        />
      </ScreenBody>
    </Screen>
  );
}
