import Colors from "@src/theme/colors";
import { Switch, Text, View } from "react-native";

type Props = {
  markAsSold: boolean;
  markAsNonInventory: boolean;
  onMarkAsSoldChange: (value: boolean) => void;
  onMarkAsNonInventoryChange: (value: boolean) => void;
  disabled?: boolean;
};

export function ProductInventoryFlagsEditor({
  markAsSold,
  markAsNonInventory,
  onMarkAsSoldChange,
  onMarkAsNonInventoryChange,
  disabled,
}: Props) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
        <View className="flex-1 pr-3">
          <Text className="text-[13px] font-semibold text-ink">
            Mark as sold
          </Text>
          <Text className="text-[11px] text-gray-500 mt-0.5 leading-4">
            Shows as sold with 0 stock. Offline orders still allowed.
          </Text>
        </View>
        <Switch
          value={markAsSold}
          onValueChange={onMarkAsSoldChange}
          disabled={disabled}
          trackColor={{
            false: Colors.border.default,
            true: Colors.brand.primary,
          }}
        />
      </View>

      <View className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
        <View className="flex-1 pr-3">
          <Text className="text-[13px] font-semibold text-ink">
            Mark as non-inventory
          </Text>
          <Text className="text-[11px] text-gray-500 mt-0.5 leading-4">
            Unlimited orders. Stock is not updated on checkout.
          </Text>
        </View>
        <Switch
          value={markAsNonInventory}
          onValueChange={onMarkAsNonInventoryChange}
          disabled={disabled}
          trackColor={{
            false: Colors.border.default,
            true: Colors.brand.primary,
          }}
        />
      </View>
    </View>
  );
}
