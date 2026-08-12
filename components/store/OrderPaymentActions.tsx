import { Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { useAppTheme } from '@src/contexts/theme-context'
import { cn } from '@src/lib/cn'
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
  const { isDark } = useAppTheme()
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
    <View
      className={cn(
        'rounded-2xl border px-4 py-4 gap-3',
        isDark ? 'border-amber-700 bg-amber-950/50' : 'border-amber-200 bg-amber-50',
      )}
    >
      <Text className="text-[15px] font-semibold text-ink">
        {awaitingUpi ? 'Awaiting UPI payment' : 'Cash on delivery'}
      </Text>
      <Text
        className={cn(
          'text-[14px] leading-5',
          isDark ? 'text-gray-300' : 'text-gray-600',
        )}
      >
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
