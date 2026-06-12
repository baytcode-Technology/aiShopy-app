import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import type {
  PaymentConfigResponse,
  UpdatePaymentConfigPayload,
} from '@src/types/payment-config'

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
