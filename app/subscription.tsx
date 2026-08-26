import { PlanCard } from '@/components/subscription/PlanCard'
import { RazorpayWebCheckout } from '@/components/subscription/RazorpayWebCheckout'
import { Button } from '@/components/ui/Button'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { SubscriptionPlanCardsSkeleton } from '@/components/ui/Skeleton'
import { Caption, Heading, Muted } from '@/components/ui/Typography'
import {
  createSubscriptionCheckout,
  fetchSubscriptionPricing,
  syncAppleSubscription,
  verifySubscriptionPayment,
  type SubscriptionCheckoutData,
  type SubscriptionPricingData,
} from '@src/api/subscriptions'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { showError, showWarning, showSuccess } from '@src/lib/toast'
import {
  BUSINESS_FEATURES,
  STARTER_FEATURES,
  formatSubscriptionExpiry,
  getBusinessPriceLabel,
  getPlanLabel,
  getStorePlan,
  hasPremiumAccess,
  isCurrentPlan,
  type SubscriptionPlan,
} from '@src/lib/subscription'
import {
  getBusinessPackage,
  getBusinessPackagePriceString,
  purchaseBusinessPackage,
  restorePurchases,
  setRevenueCatStoreId,
} from '@src/lib/revenuecat'
import { shadows } from '@src/lib/shadows'
import Colors from '@src/theme/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, type Href } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Platform, Text, View } from 'react-native'

export default function SubscriptionScreen() {
  const { user } = useAuth()
  const { store, refreshStore } = useStore()
  const [subscribing, setSubscribing] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [pricing, setPricing] = useState<SubscriptionPricingData | null>(null)
  const [pricingLoading, setPricingLoading] = useState(true)
  const [iosPriceLabel, setIosPriceLabel] = useState<string | null>(null)
  const [checkoutSession, setCheckoutSession] = useState<SubscriptionCheckoutData | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('starter')
  const premium = hasPremiumAccess(store)
  const currentPlan = getStorePlan(store)
  const expiryLabel = formatSubscriptionExpiry(store?.subscription_expires_at)
  const onBusinessPlan = isCurrentPlan(store, 'business')
  const onStarterPlan = isCurrentPlan(store, 'starter')
  const useAppleIap = Platform.OS === 'ios'

  const businessPrice = useAppleIap
    ? iosPriceLabel ?? getBusinessPriceLabel(store)
    : premium
      ? getBusinessPriceLabel(store)
      : pricing?.price_label
  const businessCompareAtPrice =
    !useAppleIap && !premium && pricing?.trial_eligible ? pricing.compare_at_label : undefined
  const businessTone =
    !useAppleIap && !premium && pricing?.trial_eligible
      ? ('trial-offer' as const)
      : ('default' as const)

  useEffect(() => {
    setSelectedPlan(currentPlan)
  }, [currentPlan, store?.id])

  useEffect(() => {
    if (store?.id) {
      void setRevenueCatStoreId(store.id)
    }
  }, [store?.id])

  useEffect(() => {
    if (useAppleIap) {
      setPricingLoading(true)
      void getBusinessPackagePriceString()
        .then(setIosPriceLabel)
        .catch(() => setIosPriceLabel(null))
        .finally(() => setPricingLoading(false))
      return
    }

    if (premium || !store?.id) {
      setPricing(null)
      setPricingLoading(false)
      return
    }

    setPricingLoading(true)
    void fetchSubscriptionPricing(store.id)
      .then(setPricing)
      .catch(() => setPricing(null))
      .finally(() => setPricingLoading(false))
  }, [premium, store?.id, useAppleIap])

  const finishAppleActivation = useCallback(async () => {
    if (!store?.id) return
    try {
      await syncAppleSubscription(store.id)
    } catch {
      // Webhook may still be in flight; refresh store either way.
    }
    await refreshStore()
    router.replace('/subscription-success' as Href)
  }, [refreshStore, store?.id])

  const handleSubscribe = async () => {
    if (!store?.id) return

    if (Platform.OS === 'web') {
      showWarning('Subscribe on the mobile app to complete payment.')
      return
    }

    setSubscribing(true)
    try {
      if (useAppleIap) {
        const pkg = await getBusinessPackage()
        if (!pkg) {
          throw new Error(
            'Business subscription is not available yet. Try again shortly or contact support.'
          )
        }
        await purchaseBusinessPackage(pkg)
        await finishAppleActivation()
        return
      }

      const checkout = await createSubscriptionCheckout(store.id)
      setCheckoutSession(checkout)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (/cancel/i.test(message)) {
        return
      }
      showError(error, 'Could not start checkout')
    } finally {
      setSubscribing(false)
    }
  }

  const handleRestore = async () => {
    if (!useAppleIap || !store?.id) return
    setRestoring(true)
    try {
      await restorePurchases()
      await syncAppleSubscription(store.id)
      await refreshStore()
      showSuccess('Purchases restored')
    } catch (error) {
      showError(error, 'Could not restore purchases')
    } finally {
      setRestoring(false)
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

  const subscribeLabel =
    useAppleIap || !pricing?.trial_eligible ? 'Subscribe' : 'Start trial'
  const showPlanCards = premium || !pricingLoading

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
            <Muted className="font-semibold text-ink">{getPlanLabel(currentPlan)}</Muted>
          </Muted>
        ) : null}

        {!showPlanCards ? (
          <SubscriptionPlanCardsSkeleton count={2} />
        ) : (
          <>
            {!premium ? (
              <PlanCard
                emoji="🆓"
                title="Starter"
                price="₹0 / month"
                features={STARTER_FEATURES}
                isCurrent={onStarterPlan}
                selected={selectedPlan === 'starter'}
                tone={onStarterPlan ? 'starter-limited' : 'default'}
                onPress={() => setSelectedPlan('starter')}
              />
            ) : null}

            <PlanCard
              emoji="🚀"
              title="Business"
              price={businessPrice ?? getBusinessPriceLabel(store)}
              compareAtPrice={businessCompareAtPrice}
              subtitle={premium ? undefined : 'Everything in Starter +'}
              features={BUSINESS_FEATURES}
              selected={selectedPlan === 'business'}
              tone={businessTone}
              isCurrent={onBusinessPlan}
              onPress={() => setSelectedPlan('business')}
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
          </>
        )}

        {useAppleIap ? (
          <Button
            label="Restore purchases"
            variant="outline"
            onPress={() => void handleRestore()}
            loading={restoring}
            className="w-full"
          />
        ) : null}
      </ScreenScrollBody>

      {!useAppleIap ? (
        <RazorpayWebCheckout
          visible={checkoutSession !== null}
          checkout={checkoutSession}
          customerEmail={user?.email}
          customerPhone={store?.whatsapp_number}
          customerName={store?.name}
          onSuccess={(payment) => void handlePaymentSuccess(payment)}
          onDismiss={() => setCheckoutSession(null)}
        />
      ) : null}
    </Screen>
  )
}
