import { Text, View } from 'react-native'
import { DetailSection } from '@/components/store/detail/DetailSection'

type Props = {
  paymentId: string
}

export function OrderRazorpayPaymentCard({ paymentId }: Props) {
  return (
    <DetailSection className="p-3.5">
      <View className="gap-1">
        <Text className="text-[13px] font-bold text-ink">Razorpay payment</Text>
        <Text className="text-[12px] text-gray-500">Paid online · auto-confirmed</Text>
        <Text className="text-[13px] text-ink mt-2" selectable>
          {paymentId}
        </Text>
      </View>
    </DetailSection>
  )
}
