import { Text, View } from 'react-native'
import {
  formatOrderStatusLabel,
  getOrderStatusBadgeColors,
} from '@src/lib/order-status'

type Props = {
  value: string
}

export function OrderStatusBadge({ value }: Props) {
  const colors = getOrderStatusBadgeColors(value)

  return (
    <View
      className="px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
      }}
    >
      <Text
        className="text-[11px] font-semibold"
        style={{ color: colors.text }}
      >
        {formatOrderStatusLabel(value)}
      </Text>
    </View>
  )
}
