import { HeaderActionsRow } from "@/components/navigation/HeaderActionsRow";
import { IconButton } from "@/components/ui/IconButton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@src/theme/colors";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  title: string;
  onBack: () => void;
  rightActions?: ReactNode;
  showSettings?: boolean;
};

export function DetailScreenHeader({
  title,
  onBack,
  rightActions,
  showSettings = true,
}: Props) {
  return (
    <View className="flex-row items-center px-4 py-3.5 bg-surface border-b border-gray-100">
      <View className="w-11 flex-row items-center justify-start shrink-0">
        <IconButton
          variant="ghost"
          onPress={onBack}
          accessibilityLabel="Go back"
        >
          <FontAwesome
            name="arrow-left"
            size={18}
            color={Colors.brand.primary}
          />
        </IconButton>
      </View>

      <Text
        className="flex-1 text-[17px] font-extrabold text-ink text-center tracking-tight px-1"
        numberOfLines={1}
      >
        {title}
      </Text>

      <View className="shrink-0 flex-row items-center justify-end max-w-[46%]">
        <HeaderActionsRow showSettings={showSettings}>
          {rightActions}
        </HeaderActionsRow>
      </View>
    </View>
  );
}
