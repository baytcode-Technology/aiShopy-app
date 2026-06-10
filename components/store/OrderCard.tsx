import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import { formatOrderListDate, orderListTitle } from '@src/lib/order-status'
import type { Order } from '@src/types/order'
import { useRouter, type Href } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

type Props = {
  order: Order
  currency?: string
  isLast?: boolean
}

export function OrderCard({ order, currency = 'INR', isLast }: Props) {
  const router = useRouter()
  const symbol = currency === 'INR' ? '₹' : '$'
  const title = orderListTitle(order)

  return (
    <Pressable
      onPress={() => router.push(`/(store)/orders/${order.id}` as Href)}
      className="active:opacity-90"
    >
      <View className={`px-4 py-4 ${isLast ? '' : 'border-b border-gray-200'}`}>
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-[15px] font-semibold text-ink" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-[15px] font-bold text-ink shrink-0">
            {symbol}
            {order.total}
          </Text>
        </View>

        <Text className="text-[13px] text-gray-400 mt-1">
          {formatOrderListDate(order.created_at)}
        </Text>

        <View className="flex-row flex-wrap gap-2 mt-2.5">
          <OrderStatusBadge value={order.order_status} />
          <OrderStatusBadge value={order.payment_status} />
          <OrderStatusBadge value={order.fulfillment_status} />
        </View>
      </View>
    </Pressable>
  )
}
