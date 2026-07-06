import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { router, useFocusEffect, type Href } from 'expo-router'
import { MenuRow } from '@/components/ui/MenuRow'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { PaymentMethodsListSkeleton } from '@/components/ui/Skeleton'
import { Muted } from '@/components/ui/Typography'
import { fetchPaymentConfig } from '@src/api/payment-config'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'

export default function PaymentMethodsScreen() {
  const { store } = useStore()
  const [loading, setLoading] = useState(true)
  const [codEnabled, setCodEnabled] = useState(false)
  const [razorpayEnabled, setRazorpayEnabled] = useState(false)
  const [upiEnabled, setUpiEnabled] = useState(false)

  const load = useCallback(async () => {
    if (!store?.id) return
    setLoading(true)
    try {
      const res = await fetchPaymentConfig(store.id)
      const cfg = res.data.payment_config
      setCodEnabled(cfg.cod.enabled)
      setRazorpayEnabled(cfg.razorpay.enabled)
      setUpiEnabled(cfg.upi.enabled)
    } catch (e) {
      showError(e, 'Could not load payment methods')
    } finally {
      setLoading(false)
    }
  }, [store?.id])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load])
  )

  const status = (enabled: boolean) => (enabled ? 'Enabled' : 'Disabled')

  return (
    <Screen>
      <ScreenHeader
        title="Payment methods"
        subtitle="Checkout & payouts"
        onBack={() => router.back()}
      />
      <ScreenScrollBody>
        <Muted className="text-[14px] leading-5 mb-4">
          Choose how customers pay at checkout. Connect and manage each method below.
        </Muted>

        {loading ? (
          <PaymentMethodsListSkeleton />
        ) : (
          <View className="gap-3">
            <MenuRow
              label="Razorpay"
              value={`${status(razorpayEnabled)} · Cards, wallets & netbanking`}
              icon="credit-card"
              showChevron
              onPress={() => router.push('/payment-methods/razorpay' as Href)}
            />
            <MenuRow
              label="Cash on delivery"
              value={`${status(codEnabled)} · Pay when the order arrives`}
              icon="money"
              showChevron
              onPress={() => router.push('/payment-methods/cod' as Href)}
            />
            <MenuRow
              label="UPI"
              value={`${status(upiEnabled)} · Manual UPI ID & QR`}
              icon="mobile"
              showChevron
              onPress={() => router.push('/payment-methods/upi' as Href)}
            />
          </View>
        )}
      </ScreenScrollBody>
    </Screen>
  )
}
