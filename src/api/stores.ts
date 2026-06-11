import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  CreateStorePayload,
  CreateStoreResponse,
  MyStoreResponse,
  UpdateStorePayload,
  UpdateStoreResponse,
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

export async function updateMyStore(
  payload: UpdateStorePayload
): Promise<UpdateStoreResponse> {
  return authFetch<UpdateStoreResponse>(endpoints.storesMe, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
