import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import type {
  CreateCustomerPayload,
  CreateCustomerResponse,
  ListCustomersResponse,
} from '@src/types/customer'

export async function fetchCustomers(storeId: number): Promise<ListCustomersResponse> {
  const qs = new URLSearchParams({ store_id: String(storeId) })
  return authenticatedFetch<ListCustomersResponse>(`${endpoints.customers}?${qs.toString()}`)
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<CreateCustomerResponse> {
  return authenticatedFetch<CreateCustomerResponse>(endpoints.customers, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
