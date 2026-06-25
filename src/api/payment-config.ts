import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import type {
  PaymentConfigResponse,
  RazorpayMode,
  UpdatePaymentConfigPayload,
} from '@src/types/payment-config'

export type RazorpaySetupTestCheckout = {
  order_id: number
  checkout_token: string
  key_id: string
  razorpay_order_id: string
  amount: number
  currency: string
  mode: RazorpayMode
  store_name: string
}

export type RazorpaySetupTestCheckoutResponse = {
  success: boolean
  message: string
  data: RazorpaySetupTestCheckout
}

export type VerifyRazorpaySetupTestPayload = {
  order_id: number
  checkout_token: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export type VerifyRazorpaySetupTestResponse = {
  success: boolean
  message: string
  data: {
    test_passed: boolean
    test_passed_mode: RazorpayMode | null
    mode: RazorpayMode
  }
}

export async function fetchPaymentConfig(): Promise<PaymentConfigResponse> {
  return authenticatedFetch<PaymentConfigResponse>(endpoints.paymentConfig)
}

export async function updatePaymentConfig(
  payload: UpdatePaymentConfigPayload
): Promise<PaymentConfigResponse> {
  return authenticatedFetch<PaymentConfigResponse>(endpoints.paymentConfig, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function startRazorpaySetupTest(): Promise<RazorpaySetupTestCheckoutResponse> {
  return authenticatedFetch<RazorpaySetupTestCheckoutResponse>(
    endpoints.paymentConfigRazorpayTestCheckout,
    { method: 'POST' }
  )
}

export async function verifyRazorpaySetupTest(
  payload: VerifyRazorpaySetupTestPayload
): Promise<VerifyRazorpaySetupTestResponse> {
  return authenticatedFetch<VerifyRazorpaySetupTestResponse>(
    endpoints.paymentConfigRazorpayVerifyTest,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}
