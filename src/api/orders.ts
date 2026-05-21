import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  ListOrdersResponse,
} from '@src/types/order'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('You are not signed in')
  }
  return apiFetch<T>(path, { ...init, token })
}

export async function fetchOrders(storeId: string): Promise<ListOrdersResponse> {
  const qs = new URLSearchParams({ store_id: storeId })
  return authFetch<ListOrdersResponse>(`${endpoints.orders}?${qs.toString()}`)
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  return authFetch<CreateOrderResponse>(endpoints.orders, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
