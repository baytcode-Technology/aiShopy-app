import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  CreateProductPayload,
  CreateProductResponse,
  ListProductsResponse,
} from '@src/types/product'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('You are not signed in')
  }
  return apiFetch<T>(path, { ...init, token })
}

export async function fetchProducts(storeId: string): Promise<ListProductsResponse> {
  const qs = new URLSearchParams({ store_id: storeId })
  return authFetch<ListProductsResponse>(`${endpoints.products}?${qs.toString()}`)
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<CreateProductResponse> {
  return authFetch<CreateProductResponse>(endpoints.products, {
    method: 'POST',
    body: JSON.stringify({
      track_inventory: false,
      images: [],
      is_active: true,
      sort_order: 0,
      metadata: {},
      stock_qty: 0,
      ...payload,
    }),
  })
}
