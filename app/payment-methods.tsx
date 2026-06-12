import { router } from 'expo-router'
import { View } from 'react-native'
import { MenuRow } from '@/components/ui/MenuRow'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Muted } from '@/components/ui/Typography'

export default function PaymentMethodsScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Payment methods"
        subtitle="Checkout & payouts"
        onBack={() => router.back()}
      />
      <ScreenBody className="px-5 pt-2">
        <Muted className="text-[14px] leading-5 mb-4">
          Choose how customers pay at checkout. Connect and manage each method below.
        </Muted>

        <View className="gap-3">
          <MenuRow
            label="Razorpay"
            value="Cards, wallets & netbanking"
            icon="credit-card"
            showChevron
            onPress={() =>
              router.push({
                pathname: '/account-coming-soon',
                params: { id: 'razorpay' },
              })
            }
          />
          <MenuRow
            label="Cash on delivery"
            value="Pay when the order arrives"
            icon="money"
            showChevron
            onPress={() =>
              router.push({
                pathname: '/account-coming-soon',
                params: { id: 'cash-on-delivery' },
              })
            }
          />
          <MenuRow
            label="UPI"
            value="PhonePe, GPay, Paytm & more"
            icon="mobile"
            showChevron
            onPress={() =>
              router.push({
                pathname: '/account-coming-soon',
                params: { id: 'upi' },
              })
            }
          />
        </View>
      </ScreenBody>
    </Screen>
  )
}
