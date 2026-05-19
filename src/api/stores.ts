import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  CreateStorePayload,
  CreateStoreResponse,
  MyStoreResponse,
} from '@src/types/store'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('You are not signed in')
  }
  return apiFetch<T>(path, { ...init, token })
}

export async function fetchMyStore(): Promise<MyStoreResponse> {
  return authFetch<MyStoreResponse>(endpoints.storesMe)
}

export async function createStore(
  payload: CreateStorePayload
): Promise<CreateStoreResponse> {
  return authFetch<CreateStoreResponse>(endpoints.stores, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
