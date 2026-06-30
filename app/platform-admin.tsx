import { Button } from "@/components/ui/Button";
import { MenuRow } from "@/components/ui/MenuRow";
import { UnreadCountBadge } from "@/components/ui/UnreadCountBadge";
import { Screen, ScreenScrollBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Muted } from "@/components/ui/Typography";
import { useAuth } from "@src/contexts/auth-context";
import { useStore } from "@src/contexts/store-context";
import { useSupportAdminSummary } from "@src/hooks/useSupportAdminSummary";
import { performSignOut } from "@src/lib/safe-sign-out";
import { shadows } from "@src/lib/shadows";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

export default function PlatformAdminScreen() {
  const { user, signOut } = useAuth();
  const { clearStore } = useStore();
  const { summary, refresh } = useSupportAdminSummary(true);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const openTickets = summary.escalated_count;
  const unreadOnTickets = summary.unread_messages;

  const handleSignOut = () => {
    void performSignOut(clearStore, signOut);
  };

  return (
    <Screen>
      <ScreenHeader
        showLogo
        title="Admin"
        subtitle="AiShopy platform support"
        showSettings={false}
      />
      <ScreenScrollBody contentContainerClassName="gap-4 px-5 pt-2 pb-8">
        <View
          className="rounded-[28px] border border-gray-200 bg-surface px-6 py-5"
          style={shadows.card}
        >
          <Caption className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mb-2">
            Signed in
          </Caption>
          <Muted className="text-[15px]">{user?.email ?? "Admin account"}</Muted>
          <Muted className="text-[13px] mt-2 leading-5">
            Manage merchant Chat with AI threads. A store is optional for this
            account.
          </Muted>
        </View>

        <View className="relative">
          <MenuRow
            label="Support inbox"
            value={
              openTickets > 0
                ? `${openTickets} open ticket${openTickets === 1 ? "" : "s"}`
                : unreadOnTickets > 0
                  ? `${unreadOnTickets} unread message${unreadOnTickets === 1 ? "" : "s"} on tickets`
                  : "AiShopy merchant Chat with AI"
            }
            icon="inbox"
            showChevron
            onPress={() => router.push("/platform-support-inbox" as Href)}
          />
          {unreadOnTickets > 0 ? (
            <View className="absolute top-3 right-5">
              <UnreadCountBadge count={unreadOnTickets} />
            </View>
          ) : null}
        </View>

        <MenuRow
          label="Create a store"
          value="Optional — run your own shop"
          icon="shopping-bag"
          showChevron
          onPress={() => router.push("/create-store" as Href)}
        />

        <View className="pt-4">
          <Button
            label="Sign out"
            variant="primary"
            onPress={() => void handleSignOut()}
            className="bg-[#E11D48] border-[#E11D48]"
            labelClassName="text-white"
          />
        </View>
      </ScreenScrollBody>
    </Screen>
  );
}
