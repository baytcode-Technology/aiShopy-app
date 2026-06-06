export type ProductStatus = 'active' | 'draft' | 'unlisted'

export type Product = {
  id: string
  store_id: string
  category_id: string | null
  name: string
  description: string | null
  sku: string | null
  base_price: number
  compare_at_price: number | null
  track_inventory: boolean
  stock_qty: number
  mark_as_sold?: boolean
  mark_as_non_inventory?: boolean
  images: string[]
  thumbnail_url: string | null
  status: ProductStatus
  is_active: boolean
  sort_order: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type ProductVariant = {
  id: string
  product_id: string
  name: string
  options: Record<string, unknown>
  price_delta: number
  compare_at_price: number | null
  stock_qty: number
  mark_as_sold?: boolean
  mark_as_non_inventory?: boolean
  sku: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
}

export type CreateProductVariantPayload = {
  name: string
  price_delta?: number
  compare_at_price?: number | null
  stock_qty?: number
  mark_as_sold?: boolean
  mark_as_non_inventory?: boolean
  sku?: string
  image_url?: string
  options?: Record<string, unknown>
  is_active?: boolean
  sort_order?: number
}

export type UpdateProductVariantPayload = Partial<{
  name: string
  price_delta: number
  compare_at_price: number | null
  stock_qty: number
  mark_as_sold: boolean
  mark_as_non_inventory: boolean
  sku: string | null
  image_url: string | null
  options: Record<string, unknown>
  is_active: boolean
  sort_order: number
}>

export type ListProductsResponse = {
  success: boolean
  message: string
  data: {
    store_id: string
    products: Product[]
    count: number
  }
}

export type CreateProductPayload = {
  store_id: string
  name: string
  base_price: number
  compare_at_price?: number | null
  images: string[]
  thumbnail_url: string
  description?: string
  sku?: string
  stock_qty?: number
  track_inventory?: boolean
  mark_as_sold?: boolean
  mark_as_non_inventory?: boolean
  status?: ProductStatus
  is_active?: boolean
  sort_order?: number
  metadata?: Record<string, unknown>
  category_id?: string
  variants?: CreateProductVariantPayload[]
}

export type CreateProductResponse = {
  success: boolean
  message: string
  data: {
    product: Product
    variants: ProductVariant[]
  }
}

export type GetProductResponse = {
  success: boolean
  message: string
  data: {
    product: Product
    variants: ProductVariant[]
  }
}
