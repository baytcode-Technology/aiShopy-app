import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import { UnreadCountBadge } from '@/components/ui/UnreadCountBadge'
import { useStoreUnread } from '@src/contexts/store-unread-context'
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
  const { isOrderUnviewed } = useStoreUnread()
  const symbol = currency === 'INR' ? '₹' : '$'
  const title = orderListTitle(order)
  const isUnviewed = isOrderUnviewed(order)
  const itemQuantity =
    order.item_quantity ??
    (order.items?.length ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0)

  return (
    <Pressable
      onPress={() => router.push(`/(store)/orders/${order.id}` as Href)}
      className="active:opacity-90"
    >
      <View className={`px-4 py-4 ${isLast ? '' : 'border-b border-gray-200'}`}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-2 min-w-0">
            <Text className="flex-1 text-[15px] font-semibold text-ink" numberOfLines={1}>
              {title}
            </Text>
            {isUnviewed && itemQuantity > 0 ? (
              <UnreadCountBadge count={itemQuantity} />
            ) : null}
          </View>
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
