import type { Store } from '@src/types/store'

export type SubscriptionPlan = 'starter' | 'business' | 'enterprise'

export const FREE_PRODUCT_LIMIT = 20
export const FREE_ORDER_LIMIT = 50

export const STARTER_FEATURES = [
  `${FREE_ORDER_LIMIT} orders / month`,
  `${FREE_PRODUCT_LIMIT} products`,
  'Basic store link',
  '1 user',
  'Accept local payments',
  'Order management',
] as const

export const BUSINESS_FEATURES = [
  'Unlimited orders',
  'Unlimited products',
  'WhatsApp inbox integration',
  'Instagram inbox integration',
  'AI auto replies',
  'AI product recommendations',
  'Customer CRM & tags',
  'Custom domain',
  '4 staff accounts',
  'Priority support',
] as const

export const ENTERPRISE_FEATURES = [
  'Dedicated account manager',
  'Custom plans & pricing',
] as const

export const CHAT_GATE_FEATURES = [
  'WhatsApp inbox integration',
  'Instagram inbox integration',
  'AI auto replies',
  'AI product recommendations',
] as const

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
}

export function isIndiaStore(store: Pick<Store, 'country'> | null | undefined): boolean {
  return store?.country === 'India'
}

export function getBusinessPriceLabel(
  store: Pick<Store, 'country'> | null | undefined
): string {
  return isIndiaStore(store) ? '₹999 / month' : '$20 / month'
}

export function getPlanLabel(plan: SubscriptionPlan): string {
  return PLAN_LABELS[plan]
}

export function isPremiumPlan(plan: SubscriptionPlan): boolean {
  return plan === 'business' || plan === 'enterprise'
}

export function isSubscriptionExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() <= Date.now()
}

export function hasPremiumAccess(
  store: Pick<Store, 'subscription_plan' | 'subscription_expires_at'> | null | undefined
): boolean {
  if (!store) return false
  const plan = store.subscription_plan ?? 'starter'
  if (!isPremiumPlan(plan)) return false
  return !isSubscriptionExpired(store.subscription_expires_at)
}

export function getStorePlan(
  store: Pick<Store, 'subscription_plan'> | null | undefined
): SubscriptionPlan {
  return store?.subscription_plan ?? 'starter'
}

export function isCurrentPlan(
  store: Pick<Store, 'subscription_plan' | 'subscription_expires_at'> | null | undefined,
  plan: SubscriptionPlan
): boolean {
  if (!store) return plan === 'starter'
  const currentPlan = getStorePlan(store)
  if (currentPlan !== plan) return false
  if (plan === 'starter') return true
  return hasPremiumAccess(store)
}

export function formatSubscriptionExpiry(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null
  return new Date(expiresAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
