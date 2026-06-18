import { PlanCard } from '@/components/subscription/PlanCard'
import { RazorpayWebCheckout } from '@/components/subscription/RazorpayWebCheckout'
import { Button } from '@/components/ui/Button'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Muted } from '@/components/ui/Typography'
import {
  createSubscriptionCheckout,
  verifySubscriptionPayment,
  type SubscriptionCheckoutData,
} from '@src/api/subscriptions'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { showError, showSuccess, showWarning } from '@src/lib/toast'
import {
  BUSINESS_FEATURES,
  ENTERPRISE_FEATURES,
  STARTER_FEATURES,
  formatSubscriptionExpiry,
  getBusinessPriceLabel,
  getPlanLabel,
  getStorePlan,
  hasPremiumAccess,
  isCurrentPlan,
} from '@src/lib/subscription'
import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, Linking, Platform } from 'react-native'

const SUPPORT_EMAIL = 'support@aishopy.io'

export default function SubscriptionScreen() {
  const { user } = useAuth()
  const { store, refreshStore } = useStore()
  const [subscribing, setSubscribing] = useState(false)
  const [checkoutSession, setCheckoutSession] = useState<SubscriptionCheckoutData | null>(null)
  const premium = hasPremiumAccess(store)
  const businessPrice = getBusinessPriceLabel(store)
  const expiryLabel = formatSubscriptionExpiry(store?.subscription_expires_at)
  const onBusinessPlan = isCurrentPlan(store, 'business')

  const handleSubscribe = async () => {
    if (Platform.OS === 'web') {
      showWarning('Subscribe on the mobile app to complete payment.')
      return
    }

    setSubscribing(true)
    try {
      const checkout = await createSubscriptionCheckout()
      setCheckoutSession(checkout)
    } catch (error) {
      showError(error, 'Could not start checkout')
    } finally {
      setSubscribing(false)
    }
  }

  const handlePaymentSuccess = async (payment: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => {
    if (!checkoutSession) return

    setSubscribing(true)
    try {
      await verifySubscriptionPayment({
        checkout_id: checkoutSession.checkout_id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
      })

      setCheckoutSession(null)
      await refreshStore()
      showSuccess('Subscription activated', 'Your Business plan is now active.')
    } catch (error) {
      showError(error, 'Payment received but activation failed. Contact support.')
    } finally {
      setSubscribing(false)
    }
  }

  const handleEnterpriseContact = () => {
    const subject = encodeURIComponent('Enterprise plan inquiry')
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in the Enterprise plan for my store${store?.name ? ` (${store.name})` : ''}.\n\n`
    )
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    void Linking.openURL(url).catch(() => {
      Alert.alert(
        "Let's talk",
        `Email us at ${SUPPORT_EMAIL} to discuss Enterprise pricing.`
      )
    })
  }

  return (
    <Screen>
      <ScreenHeader
        title="Subscription"
        subtitle="Choose the plan that fits your store"
        onBack={() => router.back()}
        showSettings
      />
      <ScreenScrollBody contentContainerClassName="gap-5 pb-10">
        {store ? (
          <Muted className="text-[14px] leading-5">
            Current plan:{' '}
            <Muted className="font-semibold text-ink">
              {getPlanLabel(getStorePlan(store))}
            </Muted>
            {premium && expiryLabel ? ` · Renews ${expiryLabel}` : null}
          </Muted>
        ) : null}

        <PlanCard
          emoji="🆓"
          title="Starter"
          price="₹0 / month"
          features={STARTER_FEATURES}
          isCurrent={isCurrentPlan(store, 'starter')}
        />

        <PlanCard
          emoji="🚀"
          title="Business"
          price={businessPrice}
          subtitle="Everything in Starter +"
          features={BUSINESS_FEATURES}
          highlight={!premium}
          isCurrent={onBusinessPlan}
          footer={
            <>
              {onBusinessPlan && expiryLabel ? (
                <Muted className="text-[13px] mb-3">Active until {expiryLabel}</Muted>
              ) : null}
              <Button
                label={onBusinessPlan ? 'Renew plan' : 'Subscribe'}
                onPress={() => void handleSubscribe()}
                loading={subscribing}
                className="w-full"
              />
            </>
          }
        />

        <PlanCard
          emoji="🏢"
          title="Enterprise"
          price="Let's Talk"
          subtitle="Everything in Business +"
          features={ENTERPRISE_FEATURES}
          isCurrent={isCurrentPlan(store, 'enterprise')}
          footer={
            <>
              {isCurrentPlan(store, 'enterprise') && expiryLabel ? (
                <Muted className="text-[13px] mb-3">Active until {expiryLabel}</Muted>
              ) : null}
              {!isCurrentPlan(store, 'enterprise') ? (
                <Button
                  label="Let's Talk"
                  variant="outline"
                  onPress={handleEnterpriseContact}
                  className="w-full"
                />
              ) : null}
            </>
          }
        />
      </ScreenScrollBody>

      <RazorpayWebCheckout
        visible={checkoutSession !== null}
        checkout={checkoutSession}
        customerEmail={user?.email}
        customerPhone={store?.whatsapp_number}
        customerName={store?.name}
        onSuccess={(payment) => void handlePaymentSuccess(payment)}
        onDismiss={() => setCheckoutSession(null)}
      />
    </Screen>
  )
}
