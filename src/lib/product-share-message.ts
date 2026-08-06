import { unitPrice } from '@/components/store/order-create/types'
import { formatMoney } from '@src/lib/format-money'
import { buildStorefrontProductUrl } from '@src/lib/storefront'
import type { Product, ProductVariant } from '@src/types/product'

type BuildProductShareMessageInput = {
  product: Product
  variant: ProductVariant | null
  currency?: string
  storeSlug: string
}

export function buildProductShareMessage({
  product,
  variant,
  currency,
  storeSlug,
}: BuildProductShareMessageInput): string {
  const price = formatMoney(unitPrice(product, variant), currency)
  const title = variant ? `${product.name} — ${variant.name}` : product.name
  const url = buildStorefrontProductUrl(storeSlug, product, variant?.id ?? null)

  return `${title}\n${price}\n\n${url}`
}
