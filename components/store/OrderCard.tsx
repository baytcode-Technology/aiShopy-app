import { StyleSheet, Text, View } from 'react-native'
import type { Order } from '@src/types/order'
import { theme } from '@src/theme/colors'

const STATUS_COLORS: Record<string, string> = {
  confirmed: theme.success,
  pending_payment: '#B45309',
  cancelled: theme.gray400,
  delivered: theme.black,
}

type Props = {
  order: Order
  currency?: string
}

export function OrderCard({ order, currency = 'INR' }: Props) {
  const symbol = currency === 'INR' ? '₹' : '$'
  const customerName = order.customers?.name ?? order.customers?.whatsapp_number ?? 'Customer'
  const itemCount = order.items?.length ?? 0
  const statusColor = STATUS_COLORS[order.status] ?? theme.gray600

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.number}>{order.order_number}</Text>
        <Text style={[styles.status, { color: statusColor }]}>{order.status.replace('_', ' ')}</Text>
      </View>
      <Text style={styles.customer}>{customerName}</Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.total}>
          {symbol}
          {order.total}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  number: { fontSize: 15, fontWeight: '700', color: theme.black },
  status: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  customer: { fontSize: 14, color: theme.gray600, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: 13, color: theme.gray600 },
  total: { fontSize: 16, fontWeight: '700', color: theme.black },
})
