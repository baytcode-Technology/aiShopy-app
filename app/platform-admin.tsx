import { Button } from "@/components/ui/Button";
import { MenuRow } from "@/components/ui/MenuRow";
import { Screen, ScreenScrollBody } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Caption, Muted } from "@/components/ui/Typography";
import { useAuth } from "@src/contexts/auth-context";
import { useStore } from "@src/contexts/store-context";
import { shadows } from "@src/lib/shadows";
import { router, type Href } from "expo-router";
import { View } from "react-native";

export default function PlatformAdminScreen() {
  const { user, signOut } = useAuth();
  const { clearStore } = useStore();

  const handleSignOut = async () => {
    await clearStore();
    await signOut();
    router.replace("/(auth)/login" as Href);
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

        <MenuRow
          label="Support inbox"
          value="AiShopy merchant Chat with AI"
          icon="inbox"
          showChevron
          onPress={() => router.push("/platform-support-inbox" as Href)}
        />

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
