import { PlanCard } from '@/components/subscription/PlanCard'
import { Button } from '@/components/ui/Button'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Muted } from '@/components/ui/Typography'
import { useStore } from '@src/contexts/store-context'
import { showWarning } from '@src/lib/toast'
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
import { Alert, Linking } from 'react-native'

const SUPPORT_EMAIL = 'support@aishopy.io'

export default function SubscriptionScreen() {
  const { store } = useStore()
  const premium = hasPremiumAccess(store)
  const businessPrice = getBusinessPriceLabel(store)
  const expiryLabel = formatSubscriptionExpiry(store?.subscription_expires_at)

  const handleSubscribe = () => {
    showWarning('Payment coming soon. Razorpay checkout will be available in the next update.')
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
          isCurrent={isCurrentPlan(store, 'business')}
          footer={
            <>
              {isCurrentPlan(store, 'business') && expiryLabel ? (
                <Muted className="text-[13px] mb-3">Active until {expiryLabel}</Muted>
              ) : null}
              {!isCurrentPlan(store, 'business') ? (
                <Button label="Subscribe" onPress={handleSubscribe} className="w-full" />
              ) : null}
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
    </Screen>
  )
}
