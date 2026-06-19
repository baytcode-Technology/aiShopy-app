import { PlanCard } from '@/components/subscription/PlanCard'
import { RazorpayWebCheckout } from '@/components/subscription/RazorpayWebCheckout'
import { Button } from '@/components/ui/Button'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Caption, Heading, Muted } from '@/components/ui/Typography'
import {
  createSubscriptionCheckout,
  fetchSubscriptionPricing,
  verifySubscriptionPayment,
  type SubscriptionCheckoutData,
  type SubscriptionPricingData,
} from '@src/api/subscriptions'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { showError, showWarning } from '@src/lib/toast'
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
import { shadows } from '@src/lib/shadows'
import Colors from '@src/theme/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, type Href } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Linking, Platform, Text, View } from 'react-native'

const SUPPORT_EMAIL = 'support@aishopy.io'

export default function SubscriptionScreen() {
  const { user } = useAuth()
  const { store, refreshStore } = useStore()
  const [subscribing, setSubscribing] = useState(false)
  const [pricing, setPricing] = useState<SubscriptionPricingData | null>(null)
  const [checkoutSession, setCheckoutSession] = useState<SubscriptionCheckoutData | null>(null)
  const premium = hasPremiumAccess(store)
  const currentPlan = getStorePlan(store)
  const businessPrice = premium
    ? getBusinessPriceLabel(store)
    : (pricing?.price_label ?? getBusinessPriceLabel(store))
  const businessCompareAtPrice =
    !premium && pricing?.trial_eligible ? pricing.compare_at_label : undefined
  const expiryLabel = formatSubscriptionExpiry(store?.subscription_expires_at)
  const onBusinessPlan = isCurrentPlan(store, 'business')
  const onEnterprisePlan = isCurrentPlan(store, 'enterprise')

  useEffect(() => {
    if (premium) {
      setPricing(null)
      return
    }

    void fetchSubscriptionPricing()
      .then(setPricing)
      .catch(() => setPricing(null))
  }, [premium, store?.id])

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
      router.replace('/subscription-success' as Href)
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

  const subscribeLabel = pricing?.trial_eligible ? 'Start trial' : 'Subscribe'

  return (
    <Screen>
      <ScreenHeader
        title="Subscription"
        subtitle={premium ? 'Your active plan' : 'Choose the plan that fits your store'}
        onBack={() => router.back()}
        showSettings
      />
      <ScreenScrollBody contentContainerClassName="gap-5 pb-10">
        {premium ? (
          <View
            className="rounded-[28px] border-2 border-brand-green bg-[#E8F8EC] px-6 py-5"
            style={shadows.card}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Caption className="text-[10px] uppercase tracking-widest text-brand-green font-bold mb-2">
                  Active plan
                </Caption>
                <Heading className="text-2xl tracking-tight text-ink">
                  {getPlanLabel(currentPlan)}
                </Heading>
                {expiryLabel ? (
                  <View className="flex-row items-center gap-2 mt-3">
                    <FontAwesome name="calendar" size={14} color="#EF4444" />
                    <Text className="text-[15px] font-semibold text-[#EF4444]">
                      Valid until {expiryLabel}
                    </Text>
                  </View>
                ) : null}
                <Muted className="mt-2 text-[13px] leading-5">
                  Your subscription stays active through the end of this date.
                </Muted>
              </View>
              <View className="w-12 h-12 rounded-full bg-brand-green/15 items-center justify-center">
                <FontAwesome name="check" size={18} color={Colors.brand.green} />
              </View>
            </View>
          </View>
        ) : store ? (
          <Muted className="text-[14px] leading-5">
            Current plan:{' '}
            <Muted className="font-semibold text-ink">
              {getPlanLabel(currentPlan)}
            </Muted>
          </Muted>
        ) : null}

        {!premium ? (
          <PlanCard
            emoji="🆓"
            title="Starter"
            price="₹0 / month"
            features={STARTER_FEATURES}
            isCurrent={isCurrentPlan(store, 'starter')}
          />
        ) : null}

        <PlanCard
          emoji="🚀"
          title="Business"
          price={businessPrice}
          compareAtPrice={businessCompareAtPrice}
          subtitle={premium ? undefined : 'Everything in Starter +'}
          features={BUSINESS_FEATURES}
          highlight={onBusinessPlan || (!premium && pricing?.trial_eligible)}
          isCurrent={onBusinessPlan}
          footer={
            onBusinessPlan ? (
              <Button
                label="Renew plan"
                onPress={() => void handleSubscribe()}
                loading={subscribing}
                className="w-full"
              />
            ) : !premium ? (
              <Button
                label={subscribeLabel}
                onPress={() => void handleSubscribe()}
                loading={subscribing}
                className="w-full"
              />
            ) : null
          }
        />

        <PlanCard
          emoji="🏢"
          title="Enterprise"
          price="Let's Talk"
          subtitle={premium ? undefined : 'Everything in Business +'}
          features={ENTERPRISE_FEATURES}
          highlight={onEnterprisePlan}
          isCurrent={onEnterprisePlan}
          footer={
            !onEnterprisePlan ? (
              <Button
                label="Let's Talk"
                variant="outline"
                onPress={handleEnterpriseContact}
                className="w-full"
              />
            ) : null
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
