import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import type {
  CreateProductPayload,
  CreateProductResponse,
  CreateProductVariantPayload,
  GetProductResponse,
  ListProductsResponse,
  Product,
  ProductStatus,
  ProductVariant,
  UpdateProductVariantPayload,
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

export type UpdateProductPayload = Partial<{
  name: string
  base_price: number
  compare_at_price: number | null
  description: string | null
  sku: string | null
  stock_qty: number
  track_inventory: boolean
  mark_as_sold?: boolean
  mark_as_non_inventory?: boolean
  status: ProductStatus
  is_active?: boolean
  category_id: string | null
  images: string[]
  thumbnail_url: string
}>

export type UpdateProductResponse = {
  success: boolean
  message: string
  data: Product
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload
): Promise<UpdateProductResponse> {
  return authFetch<UpdateProductResponse>(`${endpoints.products}/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

type VariantResponse = {
  success: boolean
  message: string
  data: { variant: ProductVariant }
}

export async function createProductVariant(
  productId: string,
  payload: CreateProductVariantPayload
): Promise<VariantResponse> {
  return authFetch<VariantResponse>(`${endpoints.products}/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify({
      price_delta: 0,
      stock_qty: 0,
      is_active: true,
      sort_order: 0,
      options: {},
      ...payload,
    }),
  })
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  payload: UpdateProductVariantPayload
): Promise<VariantResponse> {
  return authFetch<VariantResponse>(
    `${endpoints.products}/${productId}/variants/${variantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  )
}

export async function deleteProductVariant(
  productId: string,
  variantId: string
): Promise<{ success: boolean; message: string }> {
  return authFetch(`${endpoints.products}/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  })
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<CreateProductResponse> {
  return authFetch<CreateProductResponse>(endpoints.products, {
    method: 'POST',
    body: JSON.stringify({
      track_inventory: false,
      status: 'active',
      is_active: true,
      sort_order: 0,
      metadata: {},
      stock_qty: 0,
      variants: [],
      ...payload,
    }),
  })
}
