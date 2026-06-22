import { Text, View } from 'react-native'
import { DetailSection } from '@/components/store/detail/DetailSection'

type Props = {
  failed?: boolean
}

export function OrderRazorpayPendingCard({ failed }: Props) {
  return (
    <DetailSection className="p-3.5 border-amber-200 bg-amber-50">
      <View className="gap-1">
        <Text className="text-[13px] font-bold text-ink">
          {failed ? 'Razorpay payment failed' : 'Awaiting Razorpay payment'}
        </Text>
        <Text className="text-[12px] text-gray-600 leading-5">
          {failed
            ? 'The customer’s online payment did not go through. They can try again from your storefront checkout, or you can cancel this order.'
            : 'The customer started checkout but has not paid yet. Payment confirms automatically when they complete Razorpay checkout on your storefront.'}
        </Text>
      </View>
    </DetailSection>
  )
}
