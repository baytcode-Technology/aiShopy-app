import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  CreateProductPayload,
  CreateProductResponse,
  GetProductResponse,
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

export async function fetchProduct(
  productId: string,
  storeId?: string
): Promise<GetProductResponse> {
  try {
    return await authFetch<GetProductResponse>(`${endpoints.products}/${productId}`)
  } catch (e) {
    const message = e instanceof Error ? e.message : ''
    const routeMissing =
      message.includes('404') ||
      message.includes('Cannot GET') ||
      message.toLowerCase().includes('not found')

    if (storeId && routeMissing) {
      const list = await fetchProducts(storeId)
      const product = list.data.products.find((p) => p.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }
      return {
        success: true,
        message: 'Product fetched from list (detail API not deployed yet)',
        data: { product, variants: [] },
      }
    }
    throw e
  }
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<CreateProductResponse> {
  return authFetch<CreateProductResponse>(endpoints.products, {
    method: 'POST',
    body: JSON.stringify({
      track_inventory: false,
      is_active: true,
      sort_order: 0,
      metadata: {},
      stock_qty: 0,
      variants: [],
      ...payload,
    }),
  })
}
