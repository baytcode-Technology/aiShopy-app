import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
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

export async function fetchProducts(storeId: number): Promise<ListProductsResponse> {
  // #region agent log
  fetch('http://127.0.0.1:7642/ingest/403551e5-c17d-483b-8ef5-ce6768f0a7b2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f8490e' },
    body: JSON.stringify({
      sessionId: 'f8490e',
      location: 'products.ts:fetchProducts',
      message: 'fetchProducts called',
      data: { storeId, storeIdType: typeof storeId, isFinite: Number.isFinite(storeId) },
      timestamp: Date.now(),
      hypothesisId: 'H4-app-store-id',
    }),
  }).catch(() => {})
  // #endregion
  const qs = new URLSearchParams({ store_id: String(storeId) })
  return authenticatedFetch<ListProductsResponse>(`${endpoints.products}?${qs.toString()}`)
}

export async function fetchProduct(
  productId: number,
  storeId?: number
): Promise<GetProductResponse> {
  try {
    return await authenticatedFetch<GetProductResponse>(`${endpoints.products}/${productId}`)
  } catch (e) {
    const message = e instanceof Error ? e.message : ''
    const routeMissing =
      message.includes('404') ||
      message.includes('Cannot GET') ||
      message.toLowerCase().includes('not found')

    if (storeId != null && routeMissing) {
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
  is_active: boolean
  category_id: number | null
  images: string[]
  thumbnail_url: string
}>

export type UpdateProductResponse = {
  success: boolean
  message: string
  data: Product
}

export async function updateProduct(
  productId: number,
  payload: UpdateProductPayload
): Promise<UpdateProductResponse> {
  return authenticatedFetch<UpdateProductResponse>(`${endpoints.products}/${productId}`, {
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
  productId: number,
  payload: CreateProductVariantPayload
): Promise<VariantResponse> {
  return authenticatedFetch<VariantResponse>(`${endpoints.products}/${productId}/variants`, {
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
  productId: number,
  variantId: number,
  payload: UpdateProductVariantPayload
): Promise<VariantResponse> {
  return authenticatedFetch<VariantResponse>(
    `${endpoints.products}/${productId}/variants/${variantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  )
}

export async function deleteProductVariant(
  productId: number,
  variantId: number
): Promise<{ success: boolean; message: string }> {
  return authenticatedFetch(`${endpoints.products}/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  })
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<CreateProductResponse> {
  return authenticatedFetch<CreateProductResponse>(endpoints.products, {
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
