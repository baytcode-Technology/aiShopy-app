import { LockedMenuRow } from "@/components/subscription/LockedMenuRow";
import { DeleteAccountSection } from "@/components/account/DeleteAccountSection";
import { CustomDomainPanel } from "@/components/admin/CustomDomainPanel";
import { Screen, ScreenScrollBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Muted } from "@/components/ui/Typography";
import { env } from "@src/config/env";
import { useStore } from "@src/contexts/store-context";
import { shadows } from "@src/lib/shadows";
import { hasPremiumAccess } from "@src/lib/subscription";
import { Redirect, router, type Href } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function AdminDashboardScreen() {
  const { store, role } = useStore();
  const premium = hasPremiumAccess(store);
  const [domainOpen, setDomainOpen] = useState(false);

  if (role === "staff") {
    return <Redirect href="/settings" />;
  }

  const currentDomain =
    store?.custom_domain_status === "active" && store.custom_domain
      ? store.custom_domain
      : store?.slug
        ? `${store.slug}.${env.storefrontBaseDomain}`
        : "—";

  const goToSubscription = () => router.push("/subscription" as Href);

  const handleDomainPress = () => {
    if (!premium) {
      goToSubscription();
      return;
    }
    setDomainOpen((open) => !open);
  };

  return (
    <Screen>
      <ScreenHeader
        title="Admin Dashboard"
        subtitle="Connect channels and manage integrations"
        onBack={() => router.back()}
        showSettings
      />
      <ScreenScrollBody contentContainerClassName="gap-4">
        <Muted className="text-[14px] leading-5 mb-1">
          Link your business accounts through Meta. Manage your store domain
          below.
        </Muted>

        <LockedMenuRow
          locked={!premium}
          onLockedPress={goToSubscription}
          label="WhatsApp"
          value="Connect phone + inbox"
          icon="whatsapp"
          showChevron
          onPress={() => router.push("/connect-whatsapp" as Href)}
        />

        <LockedMenuRow
          locked={!premium}
          onLockedPress={goToSubscription}
          label="Instagram"
          value="Connect business account"
          icon="instagram"
          showChevron
          onPress={() => router.push("/instagram-connect" as Href)}
        />

        <LockedMenuRow
          locked={!premium}
          onLockedPress={goToSubscription}
          label="Chat Boat"
          value="Smart assistant for your store"
          icon="magic"
          showChevron
          onPress={() => router.push("/chat-boat" as Href)}
        />

        <LockedMenuRow
          locked={!premium}
          onLockedPress={goToSubscription}
          label="Staff management"
          value="Invite team & assign roles"
          icon="users"
          showChevron
          onPress={() => router.push("/staff-management" as Href)}
        />

        <View>
          <LockedMenuRow
            locked={!premium}
            onLockedPress={goToSubscription}
            label="Domain"
            value={
              domainOpen ? "Hide domain settings" : "Current & custom domain"
            }
            icon="globe"
            showChevron={premium}
            onPress={handleDomainPress}
          />

          {domainOpen && premium ? (
            <View
              className="mt-3 rounded-2xl border border-gray-200 bg-surface overflow-hidden"
              style={shadows.sm}
            >
              <View className="px-5 py-4 border-b border-gray-100">
                <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                  Current domain
                </Caption>
                <Text className="text-[15px] font-semibold text-ink">
                  {currentDomain}
                </Text>
                <Muted className="mt-1.5 text-[13px]">
                  Your live storefront address
                </Muted>
              </View>

              <CustomDomainPanel />
            </View>
          ) : null}
        </View>

        <DeleteAccountSection storeName={store?.name} />
      </ScreenScrollBody>
    </Screen>
  );
}
