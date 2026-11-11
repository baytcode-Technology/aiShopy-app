import { Text, View } from 'react-native'
import { DetailSection } from '@/components/store/detail/DetailSection'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import { Muted } from '@/components/ui/Typography'
import { formatMoney } from '@src/lib/format-money'
import {
  countOrderItems,
  formatOrderInvoiceDate,
  getOrderChannelLabel,
  isPosOrder,
} from '@src/lib/order-invoice'
import type { Order } from '@src/types/order'

type Props = {
  order: Order
  currency?: string
}

export function OrderSummaryCard({ order, currency }: Props) {
  const itemCount = countOrderItems(order.items ?? [])
  const customerName =
    order.customers?.name?.trim() ||
    order.customers?.whatsapp_number ||
    (isPosOrder(order) ? 'Walk-in customer' : 'Customer')

  return (
    <DetailSection className="gap-3 p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[17px] font-semibold text-ink" numberOfLines={1}>
            {customerName}
          </Text>
          <Muted className="text-[13px]">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · {getOrderChannelLabel(order)} ·{' '}
            {formatOrderInvoiceDate(order.created_at)}
          </Muted>
        </View>
        <OrderStatusBadge value={order.payment_status} />
      </View>
      <Text className="text-[28px] font-extrabold tracking-tight text-ink">
        {formatMoney(order.total, currency)}
      </Text>
    </DetailSection>
  )
}
