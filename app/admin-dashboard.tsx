import { MenuRow } from "@/components/ui/MenuRow";
import { Screen, ScreenScrollBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { env } from "@src/config/env";
import { useStore } from "@src/contexts/store-context";
import { shadows } from "@src/lib/shadows";
import Colors from "@src/theme/colors";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
export default function AdminDashboardScreen() {
  const { store } = useStore();
  const [domainOpen, setDomainOpen] = useState(false);
  const [customDomainComingSoon, setCustomDomainComingSoon] = useState(false);

  const currentDomain = store?.slug
    ? `${store.slug}.${env.storefrontBaseDomain}`
    : "—";

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

        <MenuRow
          label="WhatsApp"
          value="Connect phone + inbox"
          icon="whatsapp"
          showChevron
          onPress={() => router.push("/connect-whatsapp" as Href)}
        />

        <MenuRow
          label="Instagram"
          value="Connect business account"
          icon="instagram"
          showChevron
          onPress={() => router.push("/instagram-connect" as Href)}
        />

        <MenuRow
          label="Chat Boat"
          value="Smart assistant for your store"
          icon="magic"
          showChevron
          onPress={() => router.push('/chat-boat' as Href)}
        />

        <MenuRow
          label="Staff management"
          value="Invite team & assign roles"
          icon="users"
          showChevron
          onPress={() =>
            router.push({
              pathname: '/account-coming-soon',
              params: { id: 'staff-management' },
            })
          }
        />

        <View>
          <MenuRow
            label="Domain"
            value={
              domainOpen ? "Hide domain settings" : "Current & custom domain"
            }
            icon="globe"
            showChevron
            onPress={() => {
              setDomainOpen((open) => !open);
              if (domainOpen) setCustomDomainComingSoon(false);
            }}
          />

          {domainOpen ? (
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
                onPress={() => setCustomDomainComingSoon(true)}
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
    </Screen>
  );
}
