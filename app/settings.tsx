import { DeleteAccountSection } from "@/components/account/DeleteAccountSection";
import { EditStoreLogoModal } from "@/components/store/EditStoreLogoModal";
import { EditStoreModal } from "@/components/store/EditStoreModal";
import { StoreAvatar } from "@/components/store/StoreAvatar";
import { StoreLogoEditLink } from "@/components/store/StoreLogoPicker";
import { StorefrontUrlActions } from "@/components/store/StorefrontUrlActions";
import { ThemeToggleChip } from "@/components/ui/ThemeToggleChip";
import { Button } from "@/components/ui/Button";
import { MenuRow } from "@/components/ui/MenuRow";
import { UnreadCountBadge } from "@/components/ui/UnreadCountBadge";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Heading, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { env } from "@src/config/env";
import { useAuth } from "@src/contexts/auth-context";
import { useStore } from "@src/contexts/store-context";
import { getPlanLabel, getStorePlan } from "@src/lib/subscription";
import { getShadows } from "@src/lib/shadows";
import { buildSubdomainUrl } from "@src/lib/storefront";
import { useAppTheme } from "@src/contexts/theme-context";
import Colors from "@src/theme/colors";
import type { Store } from "@src/types/store";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { usePlatformAdmin } from "@src/hooks/usePlatformAdmin";
import { usePlatformAdminBack } from "@src/hooks/usePlatformAdminBack";
import { useSupportAdminSummary } from "@src/hooks/useSupportAdminSummary";
import { performSignOut } from "@src/lib/safe-sign-out";
import { PRIVACY_POLICY_URL, SUPPORT_EMAIL, TERMS_OF_USE_URL } from "@src/lib/support-contact";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const {
    store,
    refreshStore,
    activateStoreSession,
    subdomainUrl,
    clearStore,
    role,
  } = useStore();
  const [editOpen, setEditOpen] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);
  const { isPlatformAdmin } = usePlatformAdmin();
  const { summary } = useSupportAdminSummary(isPlatformAdmin);
  const { colors } = useAppTheme();
  const cardShadow = getShadows(colors).card;
  const goBack = usePlatformAdminBack();
  const openTickets = summary.escalated_count;
  const unreadOnTickets = summary.unread_messages;

  const handleStoreUpdated = async (updated: Store) => {
    const url = subdomainUrl ?? buildSubdomainUrl(updated.slug);
    await activateStoreSession(updated, url, role ?? "owner");
    await refreshStore();
  };

  const handleSignOut = () => {
    void performSignOut(clearStore, signOut);
  };

  const handleSendFeedback = () => {
    const subject = encodeURIComponent("AiShopy feedback");
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to share feedback.\n\nStore: ${store?.name ?? "—"}\nAccount: ${user?.email ?? "—"}\n\n`,
    );
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    void Linking.openURL(url).catch(() => {
      Alert.alert("Send feedback", `Email us at ${SUPPORT_EMAIL}`);
    });
  };

  const handleOpenLegalUrl = (url: string, label: string) => {
    void Linking.openURL(url).catch(() => {
      Alert.alert(label, `Open ${url} in your browser.`);
    });
  };

  const storefrontHost = store?.slug
    ? `${store.slug}.${env.storefrontBaseDomain}`
    : null;
  const storefrontUrl = store?.slug
    ? buildSubdomainUrl(store.slug)
    : subdomainUrl;

  const isAdminWithoutStore = isPlatformAdmin && !store;

  return (
    <Screen>
      <ScreenHeader
        showLogo
        variant="tab"
        title="Settings"
        subtitle={isAdminWithoutStore ? "Platform admin" : "Store & profile"}
        onBack={isAdminWithoutStore ? goBack : () => router.back()}
        showSettings={false}
      />
      <ScreenBody className="flex-1">
        {isAdminWithoutStore ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-5 pt-4 pb-32 gap-3"
          >
            <View
              className="rounded-[28px] border border-gray-200 bg-surface px-6 py-5 relative"
              style={cardShadow}
            >
              <View className="absolute top-5 right-5 flex-row items-center gap-2">
                <ThemeToggleChip />
              </View>
              <Caption className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mb-2">
                Admin account
              </Caption>
              <Muted className="text-[15px]">{user?.email}</Muted>
              <Muted className="text-[13px] mt-2 leading-5">
                No store linked. Use Support inbox for merchant Chat with AI.
              </Muted>
            </View>

            <MenuRow
              label="Admin home"
              value="Platform support dashboard"
              icon="home"
              showChevron
              onPress={() => router.replace("/platform-admin" as Href)}
            />
            <MenuRow
              label="Support inbox"
              value="AiShopy merchant Chat with AI"
              icon="inbox"
              showChevron
              onPress={() => router.push("/platform-support-inbox" as Href)}
            />
            <MenuRow
              label="Create a store"
              value="Optional"
              icon="shopping-bag"
              showChevron
              onPress={() => router.push("/create-store" as Href)}
            />
            <MenuRow
              label="AI & data privacy"
              value="What Chat Boat shares with AI providers"
              icon="shield"
              showChevron
              onPress={() => router.push("/ai-privacy" as Href)}
            />

            <View className="pt-4 gap-3">
              <Button
                label="Sign out"
                variant="primary"
                onPress={handleSignOut}
                className="bg-[#E11D48] border-[#E11D48]"
                labelClassName="text-white"
              />
              <DeleteAccountSection />
            </View>
          </ScrollView>
        ) : (
          <>
        <View className="px-5 pt-2 pb-4">
          <View
            className="rounded-[28px] border border-gray-200 bg-surface px-6 py-3 relative"
            style={cardShadow}
          >
            <View className="absolute top-5 right-5 flex-row items-center gap-2">
              <ThemeToggleChip />
              <Pressable
                onPress={() => setEditOpen(true)}
                className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-gray-50"
                hitSlop={8}
              >
                <FontAwesome
                  name="pencil"
                  size={12}
                  color={Colors.brand.primary}
                />
                <Text className="text-xs font-bold text-ink">Edit</Text>
              </Pressable>
            </View>

            <View className="items-start mb-4">
              <StoreAvatar store={store} />
              <StoreLogoEditLink onPress={() => setLogoOpen(true)} />
            </View>

            <Heading className="text-2xl tracking-tight pr-16">
              {store?.name ?? "Your store"}
            </Heading>
            {user?.email ? (
              <Muted className="mt-2 text-[15px]">{user.email}</Muted>
            ) : null}
            {storefrontHost && storefrontUrl ? (
              <StorefrontUrlActions
                url={storefrontUrl}
                displayHost={storefrontHost}
              />
            ) : null}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-32 gap-3"
        >
          <View className="gap-3">
            <MenuRow
              label="Storefront"
              value={storefrontHost ?? "Your store link"}
              icon="globe"
              showChevron
              onPress={() => router.push("/storefront" as Href)}
            />
            <MenuRow
              label="Website"
              value="UI design & customization"
              icon="paint-brush"
              showChevron
              onPress={() => router.push("/website-customize" as Href)}
            />
            <MenuRow
              label="Currency"
              value={store?.currency ?? "INR"}
              icon="money"
            />
            <MenuRow
              label="Payment methods"
              value="COD, cards & more"
              icon="credit-card"
              showChevron
              onPress={() => router.push("/payment-methods" as Href)}
            />
            <MenuRow
              label="Notifications"
              value="Orders, chats & alerts"
              icon="bell"
              showChevron
              onPress={() => router.push("/notifications" as Href)}
            />
            <MenuRow
              label="Printer"
              value="Receipts & labels"
              icon="print"
              showChevron
              onPress={() =>
                router.push({
                  pathname: "/account-coming-soon",
                  params: { id: "printer" },
                })
              }
            />
            <MenuRow
              label="Subscription"
              value={store ? getPlanLabel(getStorePlan(store)) : "Choose a plan"}
              icon="calendar"
              showChevron
              onPress={() => router.push("/subscription" as Href)}
            />
            {role === "owner" ? (
              <MenuRow
                label="Admin Dashboard"
                value="WhatsApp · Instagram · Chat Boat · Domain"
                icon="cog"
                showChevron
                onPress={() => router.push("/admin-dashboard" as Href)}
              />
            ) : null}

            <View className="mt-2 gap-3">
              <Caption className="text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                Support
              </Caption>

              {isPlatformAdmin ? (
                <View className="relative">
                  <MenuRow
                    label="Support inbox"
                    value={
                      openTickets > 0
                        ? `${openTickets} open ticket${openTickets === 1 ? "" : "s"}`
                        : unreadOnTickets > 0
                          ? `${unreadOnTickets} unread on tickets`
                          : "AiShopy merchant Chat with AI"
                    }
                    icon="inbox"
                    showChevron
                    onPress={() =>
                      router.push("/platform-support-inbox" as Href)
                    }
                  />
                  {unreadOnTickets > 0 ? (
                    <View className="absolute top-3 right-5">
                      <UnreadCountBadge count={unreadOnTickets} />
                    </View>
                  ) : null}
                </View>
              ) : null}

              <MenuRow
                label="Send feedback"
                value=""
                icon="comment-o"
                showChevron
                onPress={handleSendFeedback}
              />
              <MenuRow
                label="Help center"
                value=""
                icon="question-circle-o"
                showChevron
                onPress={() => router.push("/(store)/chats/support-ai" as Href)}
              />
              <MenuRow
                label="Privacy policy"
                value=""
                icon="lock"
                showChevron
                onPress={() => handleOpenLegalUrl(PRIVACY_POLICY_URL, "Privacy policy")}
              />
              <MenuRow
                label="AI & data privacy"
                value="What Chat Boat shares with AI providers"
                icon="shield"
                showChevron
                onPress={() => router.push("/ai-privacy" as Href)}
              />
              <MenuRow
                label="Terms"
                value=""
                icon="file-text-o"
                showChevron
                onPress={() => handleOpenLegalUrl(TERMS_OF_USE_URL, "Terms")}
              />
            </View>
          </View>

          <View className="pt-2 gap-3">
            <Button
              label="Sign out"
              variant="primary"
              onPress={handleSignOut}
              className="bg-[#E11D48] border-[#E11D48]"
              labelClassName="text-white"
            />
            <DeleteAccountSection storeName={store?.name} />
          </View>
        </ScrollView>

        <EditStoreModal
          visible={editOpen}
          store={store}
          onClose={() => setEditOpen(false)}
          onUpdated={handleStoreUpdated}
        />
        <EditStoreLogoModal
          visible={logoOpen}
          store={store}
          onClose={() => setLogoOpen(false)}
          onUpdated={handleStoreUpdated}
        />
          </>
        )}
      </ScreenBody>
    </Screen>
  );
}
