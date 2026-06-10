import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  formatOrderStatusLabel,
  statusFieldIcon,
  statusFieldTitle,
  type OrderStatusField,
} from '@src/lib/order-status'
import Colors from '@src/theme/colors'

type Props = {
  field: OrderStatusField
  value: string
  onPress: () => void
  disabled?: boolean
}

export function OrderStatusRow({ field, value, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center rounded-xl bg-gray-100 border border-gray-200 px-3.5 py-3.5 mb-2 active:opacity-85"
    >
      <View className="w-9 items-center">
        <FontAwesome name={statusFieldIcon(field)} size={18} color={Colors.text.secondary} />
      </View>
      <Text className="flex-1 text-[15px] font-semibold text-ink ml-2">
        {statusFieldTitle(field)}
      </Text>
      <Text className="text-[15px] font-semibold text-gray-500">
        {formatOrderStatusLabel(value)}
      </Text>
    </Pressable>
  )
}
