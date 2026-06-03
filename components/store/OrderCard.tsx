import { Text, View } from 'react-native'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Caption, Muted } from '@/components/ui/Typography'
import { shadows } from '@src/lib/shadows'
import type { Order } from '@src/types/order'

type BadgeTone = 'default' | 'emphasis' | 'muted' | 'outline'

const getStatusTone = (status: string): BadgeTone => {
  switch (status) {
    case 'confirmed':
    case 'delivered':
      return 'emphasis'
    case 'pending_payment':
      return 'outline'
    default:
      return 'muted'
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
    <Card className="mb-4 p-5 border-gray-200" elevated={false} style={shadows.card}>
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-[17px] font-extrabold text-ink tracking-tight">{order.order_number}</Text>
          <Muted className="font-medium mt-1.5 text-[14px]">{customerName}</Muted>
        </View>
        <Badge label={order.status.replace(/_/g, ' ')} tone={getStatusTone(order.status)} />
      </View>
      <View className="h-px bg-gray-100 mb-4" />
      <View className="flex-row justify-between items-center">
        <Caption className="text-gray-500">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </Caption>
        <Text className="text-xl font-extrabold text-ink tracking-tight">
          {symbol}
          {order.total}
        </Text>
      </View>
    </Card>
  )
}
