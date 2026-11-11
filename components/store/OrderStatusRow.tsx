import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import { statusFieldIcon, statusFieldTitle, type OrderStatusField } from '@src/lib/order-status'
import Colors from '@src/theme/colors'

type Props = {
  field: OrderStatusField
  value: string
  onPress: () => void
  disabled?: boolean
  grouped?: boolean
}

export function OrderStatusRow({ field, value, onPress, disabled, grouped }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={
        grouped
          ? 'flex-row items-center px-3.5 py-3.5 active:opacity-85'
          : 'mb-2 flex-row items-center rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-3.5 active:opacity-85'
      }
    >
      <View className="w-9 items-center">
        <FontAwesome name={statusFieldIcon(field)} size={18} color={Colors.text.secondary} />
      </View>
      <Text className="flex-1 text-[15px] font-semibold text-ink ml-2">
        {statusFieldTitle(field)}
      </Text>
      <OrderStatusBadge value={value} />
    </Pressable>
  )
}
