import { Text, View } from 'react-native'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Caption, Muted } from '@/components/ui/Typography'
import type { Order } from '@src/types/order'

type BadgeTone = 'default' | 'active' | 'inactive' | 'success' | 'warning' | 'danger'

const getStatusTone = (status: string): BadgeTone => {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending_payment':
      return 'warning'
    case 'cancelled':
      return 'inactive'
    case 'delivered':
      return 'default'
    default:
      return 'inactive'
  }
}

type Props = {
  order: Order
  currency?: string
}

export function OrderCard({ order, currency = 'INR' }: Props) {
  const symbol = currency === 'INR' ? '₹' : '$'
  const customerName = order.customers?.name ?? order.customers?.whatsapp_number ?? 'Customer'
  const itemCount = order.items?.length ?? 0

  return (
    <Card className="mb-3 p-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-extrabold text-ink tracking-tight">{order.order_number}</Text>
        <Badge label={order.status.replace('_', ' ')} tone={getStatusTone(order.status)} />
      </View>
      <Muted className="font-medium mb-3">{customerName}</Muted>
      <View className="h-px bg-gray-200 mb-3" />
      <View className="flex-row justify-between items-center">
        <Caption>
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </Caption>
        <Text className="text-lg font-extrabold text-ink tracking-tight">
          {symbol}
          {order.total}
        </Text>
      </View>
    </Card>
  )
}
