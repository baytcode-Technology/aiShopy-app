import { Button } from "@/components/ui/Button";
import { Heading, Muted } from "@/components/ui/Typography";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { shadows } from "@src/lib/shadows";
import { CHAT_GATE_FEATURES } from "@src/lib/subscription";
import Colors from "@src/theme/colors";
import { Text, View } from "react-native";

type Props = {
  onViewPlans: () => void;
};

export function ChatsSubscriptionGate({ onViewPlans }: Props) {
  return (
    <View className="flex-1 px-5 pt-6 pb-10 items-center justify-center">
      <View
        className="w-full rounded-[28px] border border-gray-200 bg-surface px-6 py-8 items-center"
        style={shadows.card}
      >
        <View className="w-16 h-16 rounded-2xl bg-gray-100 items-center justify-center mb-5">
          <FontAwesome5 name="crown" size={28} color={Colors.brand.primary} />
        </View>

        <Heading className="text-xl text-center tracking-tight">
          Unlock WhatsApp & Instagram inbox
        </Heading>
        <Muted className="mt-3 text-[15px] leading-6 text-center">
          Upgrade to Business to manage customer conversations, automate
          replies, and grow sales from chat.
        </Muted>

        <View className="w-full mt-6 gap-2">
          {CHAT_GATE_FEATURES.map((feature) => (
            <View key={feature} className="flex-row items-start gap-3">
              <FontAwesome5
                name="check"
                size={12}
                color={Colors.brand.primary}
                style={{ marginTop: 4 }}
              />
              <Text className="flex-1 text-[14px] leading-5 text-ink">
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <Button
          label="View plans"
          onPress={onViewPlans}
          className="w-full mt-8"
        />
      </View>
    </View>
  );
}
