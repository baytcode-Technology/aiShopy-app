import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import type {
  CreateStorePayload,
  CreateStoreResponse,
  MyStoreResponse,
  UpdateStorePayload,
  UpdateStoreResponse,
} from '@src/types/store'

export async function fetchMyStore(): Promise<MyStoreResponse> {
  return authenticatedFetch<MyStoreResponse>(endpoints.storesMe)
}

export async function createStore(
  payload: CreateStorePayload
): Promise<CreateStoreResponse> {
  return authenticatedFetch<CreateStoreResponse>(endpoints.stores, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateMyStore(
  payload: UpdateStorePayload
): Promise<UpdateStoreResponse> {
  return authenticatedFetch<UpdateStoreResponse>(endpoints.storesMe, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
