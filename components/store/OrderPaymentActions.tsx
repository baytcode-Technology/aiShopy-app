import { Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import type { Order } from '@src/types/order'

type PaymentInfo = {
  provider: string
  status: string
} | null

type Props = {
  order: Order
  payment: PaymentInfo
  saving?: boolean
  onConfirmPayment: () => void
}

export function OrderPaymentActions({ order, payment, saving, onConfirmPayment }: Props) {
  const awaitingUpi =
    payment?.provider === 'upi_manual' &&
    order.payment_status === 'confirming' &&
    order.order_status !== 'cancelled'

  const awaitingCod =
    payment?.provider === 'manual' &&
    order.payment_status === 'pending' &&
    order.order_status !== 'cancelled'

  if (!awaitingUpi && !awaitingCod) return null

  return (
    <View className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 gap-3">
      <Text className="text-[15px] font-semibold text-ink">
        {awaitingUpi ? 'Awaiting UPI payment' : 'Cash on delivery'}
      </Text>
      <Text className="text-[14px] text-gray-600 leading-5">
        {awaitingUpi
          ? 'Confirm this order after you receive the UPI transfer from the customer.'
          : 'Mark payment received after you or your delivery partner collects cash.'}
      </Text>
      <Button
        label={awaitingUpi ? 'Confirm UPI received' : 'Mark payment received'}
        loading={saving}
        onPress={onConfirmPayment}
      />
    </View>
  )
}
