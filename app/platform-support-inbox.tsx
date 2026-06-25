import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { fetchSupportAdminConversations } from "@src/api/support";
import { showError } from "@src/lib/toast";
import Colors from "@src/theme/colors";
import type { SupportAdminConversation } from "@src/types/support";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

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
  const escalated = item.status === "escalated";

  return (
    <Pressable
      onPress={onPress}
      className="px-5 py-4 border-b border-gray-100 bg-surface"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 min-w-0">
          <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
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
          <Caption className="text-gray-400">{formatRelative(item.last_message_at)}</Caption>
          {escalated ? (
            <View className="rounded-full bg-[#E8F8EC] px-2 py-0.5">
              <Caption className="text-brand-green text-[10px] font-bold uppercase">
                Escalated
              </Caption>
            </View>
          ) : null}
          {item.ticket_code ? (
            <Caption className="text-gray-400 text-[10px]">{item.ticket_code}</Caption>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function PlatformSupportInboxScreen() {
  const [items, setItems] = useState<SupportAdminConversation[]>([]);
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

  return (
    <Screen>
      <ScreenHeader
        title="Support inbox"
        subtitle="Merchant Chat with AI threads"
        onBack={() => router.back()}
      />
      <ScreenBody className="flex-1">
        <FlatList
          data={items}
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
              <FontAwesome
                name="inbox"
                size={28}
                color={Colors.text.muted}
              />
              <Muted className="mt-3 text-center">
                {isLoading
                  ? "Loading conversations…"
                  : "No active support chats"}
              </Muted>
            </View>
          }
          className="flex-1 bg-surface"
        />
      </ScreenBody>
    </Screen>
  );
}
