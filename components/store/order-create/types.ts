import type { Product, ProductVariant } from '@src/types/product'

export type CartLine = {
  key: string
  productId: string
  variantId: string | null
  quantity: number
  product: Product
  variant: ProductVariant | null
}

export function cartLineKey(productId: string, variantId: string | null): string {
  return `${productId}:${variantId ?? 'base'}`
}

export function unitPrice(product: Product, variant: ProductVariant | null): number {
  return Number(product.base_price) + Number(variant?.price_delta ?? 0)
}
