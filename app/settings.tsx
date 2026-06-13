import { EditStoreLogoModal } from "@/components/store/EditStoreLogoModal";
import { EditStoreModal } from "@/components/store/EditStoreModal";
import { StoreLogoEditLink } from "@/components/store/StoreLogoPicker";
import { StorefrontUrlActions } from "@/components/store/StorefrontUrlActions";
import { Button } from "@/components/ui/Button";
import { MenuRow } from "@/components/ui/MenuRow";
import { Screen, ScreenBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Heading, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { env } from "@src/config/env";
import { useAuth } from "@src/contexts/auth-context";
import { useStore } from "@src/contexts/store-context";
import { shadows } from "@src/lib/shadows";
import { buildSubdomainUrl } from "@src/lib/storefront";
import Colors from "@src/theme/colors";
import type { Store } from "@src/types/store";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";

function StoreAvatar({ store }: { store: Store | null }) {
  const letter = store?.name?.slice(0, 1).toUpperCase() ?? "S";

  if (store?.logo_url) {
    return (
      <Image
        source={{ uri: store.logo_url }}
        className="w-16 h-16 rounded-2xl border border-gray-200 bg-gray-50"
        resizeMode="cover"
      />
    );
  }

  return (
    <View className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center">
      <Text className="text-2xl font-extrabold text-ink">{letter}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const {
    store,
    refreshStore,
    activateStoreSession,
    subdomainUrl,
    clearStore,
  } = useStore();
  const [editOpen, setEditOpen] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);

  const handleStoreUpdated = async (updated: Store) => {
    const url = subdomainUrl ?? buildSubdomainUrl(updated.slug);
    await activateStoreSession(updated, url);
    await refreshStore();
  };

  const handleSignOut = async () => {
    await clearStore();
    await signOut();
    router.replace("/(auth)/login" as Href);
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert("Coming soon", `${feature} will be available soon.`);
  };

  const storefrontHost = store?.slug
    ? `${store.slug}.${env.storefrontBaseDomain}`
    : null;
  const storefrontUrl =
    subdomainUrl ?? (store?.slug ? buildSubdomainUrl(store.slug) : null);

  return (
    <Screen>
      <ScreenHeader
        showLogo
        variant="tab"
        title="Settings"
        subtitle="Store & profile"
        onBack={() => router.back()}
        showSettings={false}
      />
      <ScreenBody className="flex-1">
        <View className="px-5 pt-2 pb-4">
          <View
            className="rounded-[28px] border border-gray-200 bg-surface px-6 py-3 relative"
            style={shadows.card}
          >
            <Pressable
              onPress={() => setEditOpen(true)}
              className="absolute top-5 right-5 flex-row items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-gray-50"
              hitSlop={8}
            >
              <FontAwesome
                name="pencil"
                size={12}
                color={Colors.brand.primary}
              />
              <Text className="text-xs font-bold text-ink">Edit</Text>
            </Pressable>

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
              onPress={() =>
                router.push({
                  pathname: "/account-coming-soon",
                  params: { id: "website" },
                })
              }
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
              value="Plan & billing"
              icon="calendar"
              showChevron
              onPress={() =>
                router.push({
                  pathname: "/account-coming-soon",
                  params: { id: "subscription" },
                })
              }
            />
            <MenuRow
              label="Admin Dashboard"
              value="WhatsApp · Instagram · Chat Boat · Domain"
              icon="cog"
              showChevron
              onPress={() => router.push("/admin-dashboard" as Href)}
            />

            <View className="mt-2 gap-3">
              <Caption className="text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                Support
              </Caption>

              <MenuRow
                label="Send feedback"
                value=""
                icon="comment-o"
                showChevron
                onPress={() => handleComingSoon("Send feedback")}
              />
              <MenuRow
                label="Help center"
                value=""
                icon="question-circle-o"
                showChevron
                onPress={() => handleComingSoon("Help center")}
              />
              <MenuRow
                label="Privacy policy"
                value=""
                icon="lock"
                showChevron
                onPress={() => handleComingSoon("Privacy policy")}
              />
              <MenuRow
                label="Terms"
                value=""
                icon="file-text-o"
                showChevron
                onPress={() => handleComingSoon("Terms")}
              />
            </View>
          </View>

          <View className="pt-2">
            <Button
              label="Sign out"
              variant="primary"
              onPress={handleSignOut}
              className="bg-[#E11D48] border-[#E11D48]"
              labelClassName="text-white"
            />
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
      </ScreenBody>
    </Screen>
  );
}
