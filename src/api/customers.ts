import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  CreateCustomerPayload,
  CreateCustomerResponse,
  ListCustomersResponse,
} from '@src/types/customer'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('You are not signed in')
  }
  return apiFetch<T>(path, { ...init, token })
}

export async function fetchCustomers(storeId: string): Promise<ListCustomersResponse> {
  const qs = new URLSearchParams({ store_id: storeId })
  return authFetch<ListCustomersResponse>(`${endpoints.customers}?${qs.toString()}`)
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<CreateCustomerResponse> {
  return authFetch<CreateCustomerResponse>(endpoints.customers, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
