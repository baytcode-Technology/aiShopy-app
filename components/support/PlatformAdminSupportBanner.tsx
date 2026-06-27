import { AppPressable } from "@/components/ui/AppPressable";
import { Caption, Muted } from "@/components/ui/Typography";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@src/theme/colors";
import { router, type Href } from "expo-router";
import { Text, View } from "react-native";

export function PlatformAdminSupportBanner() {
  return (
    <AppPressable
      onPress={() => router.push("/platform-support-inbox" as Href)}
      containerClassName="mx-1 mb-3 rounded-2xl border border-brand-green/30 bg-[#E8F8EC] px-4 py-3 flex-row items-center gap-3"
    >
      <View className="w-10 h-10 rounded-full bg-brand-green items-center justify-center">
        <FontAwesome name="inbox" size={16} color={Colors.brand.onPrimary} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-[14px] font-semibold text-ink">
          Merchant support inbox
        </Text>
        <Muted className="text-[12px] mt-0.5 leading-4">
          AiShopy Chat with AI threads from merchants — not WhatsApp/Instagram
        </Muted>
      </View>
      <FontAwesome name="chevron-right" size={12} color={Colors.brand.green} />
    </AppPressable>
  );
}
