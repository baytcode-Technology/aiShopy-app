import { authenticatedFetch } from './client'
import { endpoints } from './endpoints'
import { storeIdQuery } from './stores'

export type SubscriptionCheckoutData = {
  checkout_id: number
  key_id: string
  order_id: string
  amount: number
  currency: string
  plan: 'business'
  store_name: string
  is_trial: boolean
  regular_amount: number
}

export type SubscriptionPricingData = {
  trial_eligible: boolean
  currency: 'INR' | 'USD'
  charge_amount: number
  charge_minor_units: number
  regular_amount: number
  regular_minor_units: number
  is_trial: boolean
  price_label: string
  compare_at_label: string
}

export type CreateSubscriptionCheckoutResponse = {
  success: boolean
  message: string
  data: SubscriptionCheckoutData
}

export type VerifySubscriptionPaymentPayload = {
  checkout_id: number
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export type VerifySubscriptionPaymentResponse = {
  success: boolean
  message: string
  data: {
    store: {
      subscription_plan: string
      subscription_expires_at: string | null
    }
    subscription_plan: string
    subscription_expires_at: string | null
  }
}

export async function fetchSubscriptionPricing(
  storeId: number
): Promise<SubscriptionPricingData> {
  const res = await authenticatedFetch<{
    success: boolean
    data: SubscriptionPricingData
  }>(`${endpoints.subscriptionsPricing}${storeIdQuery(storeId)}`)
  return res.data
}

export async function createSubscriptionCheckout(
  storeId: number
): Promise<SubscriptionCheckoutData> {
  const res = await authenticatedFetch<CreateSubscriptionCheckoutResponse>(
    `${endpoints.subscriptionsCheckout}${storeIdQuery(storeId)}`,
    { method: 'POST' }
  )
  return res.data
}

export async function verifySubscriptionPayment(
  payload: VerifySubscriptionPaymentPayload
): Promise<VerifySubscriptionPaymentResponse['data']> {
  const res = await authenticatedFetch<VerifySubscriptionPaymentResponse>(
    endpoints.subscriptionsVerify,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
  return res.data
}
