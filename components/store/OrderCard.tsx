import { StyleSheet, Text, View } from 'react-native'
import type { Order } from '@src/types/order'
import { theme } from '@src/theme/colors'

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { bg: '#ECFDF5', text: '#059669' }
    case 'pending_payment':
      return { bg: '#FFFBEB', text: '#D97706' }
    case 'cancelled':
      return { bg: '#F4F4F5', text: '#71717A' }
    case 'delivered':
      return { bg: '#E0F2FE', text: '#0369A1' }
    default:
      return { bg: '#F4F4F6', text: '#52525B' }
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
  const badge = getStatusBadgeStyle(order.status)

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.number}>{order.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>
            {order.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <Text style={styles.customer}>{customerName}</Text>
      <View style={styles.divider} />
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  number: { fontSize: 16, fontWeight: '800', color: theme.black, letterSpacing: -0.2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize', letterSpacing: 0.2 },
  customer: { fontSize: 14, color: theme.gray600, fontWeight: '500', marginBottom: 12 },
  divider: { height: 1, backgroundColor: theme.gray200, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: 13, color: theme.gray400, fontWeight: '500' },
  total: { fontSize: 18, fontWeight: '800', color: theme.black, letterSpacing: -0.3 },
})
