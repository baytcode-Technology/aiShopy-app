import { AppPressable } from "@/components/ui/AppPressable";
import { UnreadCountBadge } from "@/components/ui/UnreadCountBadge";
import { Caption, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSupportAdminSummary } from "@src/hooks/useSupportAdminSummary";
import Colors from "@src/theme/colors";
import { router, type Href } from "expo-router";
import { Text, View } from "react-native";

export function PlatformAdminSupportBanner() {
  const { summary } = useSupportAdminSummary(true);
  const openTickets = summary.escalated_count;
  const unreadOnTickets = summary.unread_messages;

  return (
    <AppPressable
      onPress={() => router.push("/platform-support-inbox" as Href)}
      containerClassName="mx-1 mb-3 rounded-2xl border-2 border-brand-green/40 bg-[#E8F8EC] px-4 py-3 flex-row items-center gap-3"
    >
      <View className="relative w-10 h-10 rounded-full bg-brand-green items-center justify-center">
        <FontAwesome name="inbox" size={16} color={Colors.brand.onPrimary} />
        {unreadOnTickets > 0 ? (
          <View className="absolute -top-1 -right-2">
            <UnreadCountBadge count={unreadOnTickets} />
          </View>
        ) : null}
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-2">
          <Text className="text-[14px] font-semibold text-ink">
            Merchant support inbox
          </Text>
          {openTickets > 0 ? (
            <Caption className="text-brand-green text-[10px] font-bold uppercase">
              {openTickets} open
            </Caption>
          ) : null}
        </View>
        <Muted className="text-[12px] mt-0.5 leading-4">
          {unreadOnTickets > 0
            ? `${unreadOnTickets} unread on open tickets`
            : openTickets > 0
              ? `${openTickets} ticket${openTickets === 1 ? "" : "s"} need attention`
              : "AiShopy Chat with AI threads from merchants"}
        </Muted>
      </View>
      <FontAwesome name="chevron-right" size={12} color={Colors.brand.green} />
    </AppPressable>
  );
}
