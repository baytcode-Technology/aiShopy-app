import { LockedMenuRow } from "@/components/subscription/LockedMenuRow";
import { Screen, ScreenScrollBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Heading, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { env } from "@src/config/env";
import { useStore } from "@src/contexts/store-context";
import { shadows } from "@src/lib/shadows";
import { hasPremiumAccess } from "@src/lib/subscription";
import Colors from "@src/theme/colors";
import { Redirect, router, type Href } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export default function AdminDashboardScreen() {
  const { store, role } = useStore();
  const premium = hasPremiumAccess(store);
  const [domainOpen, setDomainOpen] = useState(false);
  const [customDomainComingSoon, setCustomDomainComingSoon] = useState(false);
  // TEMP: Instagram coming soon — remove after Meta review approval
  const [instagramComingSoon, setInstagramComingSoon] = useState(false);

  if (role === "staff") {
    return <Redirect href="/settings" />;
  }

  const currentDomain = store?.slug
    ? `${store.slug}.${env.storefrontBaseDomain}`
    : "—";

  const goToSubscription = () => router.push("/subscription" as Href);

  const handleDomainPress = () => {
    if (!premium) {
      goToSubscription();
      return;
    }
    setDomainOpen((open) => !open);
    if (domainOpen) setCustomDomainComingSoon(false);
  };

  const handleCustomDomainPress = () => {
    if (!premium) {
      goToSubscription();
      return;
    }
    setCustomDomainComingSoon(true);
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
          onPress={() => {
            // TEMP: restore router.push("/instagram-connect") after Meta review approval
            setInstagramComingSoon(true);
          }}
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

              <Pressable
                onPress={handleCustomDomainPress}
                className="px-5 py-4 flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                    Custom domain
                  </Caption>
                  <Text className="text-[15px] font-semibold text-ink">
                    Use your own domain
                  </Text>
                  <Muted className="mt-1.5 text-[13px]">
                    e.g. shop.yourbrand.com
                  </Muted>
                </View>
                <FontAwesome
                  name="chevron-right"
                  size={12}
                  color={Colors.text.muted}
                />
              </Pressable>

              {customDomainComingSoon ? (
                <View className="px-5 pb-4 pt-0">
                  <View className="rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
                    <Text className="text-[13px] font-bold text-ink mb-1">
                      Coming soon
                    </Text>
                    <Muted className="text-[13px] leading-5">
                      Custom domain setup will be available here. You can
                      connect your own domain to your storefront soon.
                    </Muted>
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScreenScrollBody>

      {/* TEMP: Instagram coming soon — remove this modal after Meta review approval */}
      <Modal
        visible={instagramComingSoon}
        transparent
        animationType="fade"
        onRequestClose={() => setInstagramComingSoon(false)}
      >
        <View className="flex-1 justify-center px-6">
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setInstagramComingSoon(false)}
            accessibilityLabel="Dismiss"
          >
            <View className="flex-1 bg-ink-overlay" />
          </Pressable>

          <View
            className="bg-surface rounded-3xl border border-gray-200 p-6"
            style={shadows.card}
          >
            <View className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center mb-4">
              <FontAwesome
                name="instagram"
                size={22}
                color={Colors.brand.primary}
              />
            </View>
            <Heading className="text-xl mb-2">Coming soon</Heading>
            <Muted className="text-[15px] leading-[22px] mb-6">
              Instagram connection is temporarily unavailable while we finish
              Meta review. You can connect your business account here once it is
              approved.
            </Muted>
            <Pressable
              onPress={() => setInstagramComingSoon(false)}
              className="py-4 rounded-2xl items-center justify-center border-2"
              style={{
                backgroundColor: Colors.brand.primary,
                borderColor: Colors.brand.primary,
              }}
            >
              <Text className="text-[16px] font-bold">Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
