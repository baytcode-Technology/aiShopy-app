import type { Product, ProductVariant } from '@src/types/product'

/** Product-level flags apply only to simple (no-variant) products. */
export function isNonInventoryProduct(product: Product, hasVariants = false): boolean {
  if (hasVariants) return false
  return product.mark_as_non_inventory === true
}

/** Product-level flags apply only to simple (no-variant) products. */
export function isMarkedSoldProduct(product: Product, hasVariants = false): boolean {
  if (hasVariants) return false
  return product.mark_as_sold === true
}

export function isNonInventoryVariant(
  product: Product,
  variant: ProductVariant,
  hasVariants = true
): boolean {
  if (!hasVariants) return isNonInventoryProduct(product, false)
  return variant.mark_as_non_inventory === true
}

export function isMarkedSoldVariant(
  product: Product,
  variant: ProductVariant,
  hasVariants = true
): boolean {
  if (!hasVariants) return isMarkedSoldProduct(product, false)
  return variant.mark_as_sold === true
}

function toneClass(tone: ProductStockLabel['tone']): string {
  if (tone === 'danger') return 'text-[#991B1B]'
  if (tone === 'muted') return 'text-gray-400'
  return 'text-gray-500'
}

export function stockLabelToneClass(tone: ProductStockLabel['tone']): string {
  return toneClass(tone)
}

export function tracksProductStock(product: Product): boolean {
  return product.track_inventory && !isNonInventoryProduct(product, false)
}

export function tracksVariantStock(product: Product, variant: ProductVariant): boolean {
  return product.track_inventory && !isNonInventoryVariant(product, variant, true)
}

export function effectiveProductStockQty(product: Product): number {
  if (isMarkedSoldProduct(product, false)) return 0
  return product.stock_qty
}

export function effectiveVariantStockQty(product: Product, variant: ProductVariant): number {
  if (isMarkedSoldVariant(product, variant, true)) return 0
  return variant.stock_qty
}

export type ProductStockLabel = {
  text: string
  tone: 'default' | 'danger' | 'muted'
}

export function getProductStockLabel(product: Product): ProductStockLabel | null {
  if (isNonInventoryProduct(product, false)) {
    return { text: 'No inventory tracking', tone: 'muted' }
  }
  if (!product.track_inventory) return null
  if (isMarkedSoldProduct(product, false)) {
    return { text: 'Sold · 0 available', tone: 'danger' }
  }
  const qty = product.stock_qty
  const text = qty === 1 ? '1 available' : `${qty} available`
  return { text, tone: qty <= 0 ? 'danger' : 'default' }
}

export function getVariantStockLabel(
  product: Product,
  variant: ProductVariant
): ProductStockLabel | null {
  if (isNonInventoryVariant(product, variant, true)) {
    return { text: 'No inventory tracking', tone: 'muted' }
  }
  if (!product.track_inventory) return null
  if (isMarkedSoldVariant(product, variant, true)) {
    return { text: 'Sold · 0 available', tone: 'danger' }
  }
  const qty = variant.stock_qty
  const text = qty === 1 ? '1 available' : `${qty} available`
  return { text, tone: qty <= 0 ? 'danger' : 'default' }
}

export function getVariantCardInventoryFlags(
  _product: Product,
  variant: ProductVariant
): { showSoldOut: boolean; showNonInventory: boolean } {
  return {
    showSoldOut: variant.mark_as_sold === true,
    showNonInventory: variant.mark_as_non_inventory === true,
  }
}

/** Availability only (no sold / non-inventory labels) — for variant card footer. */
export function getVariantAvailabilityLabel(
  product: Product,
  variant: ProductVariant
): ProductStockLabel | null {
  if (isNonInventoryVariant(product, variant, true)) return null
  if (!product.track_inventory) return null
  const qty = effectiveVariantStockQty(product, variant)
  const text = qty === 1 ? '1 available' : `${qty} available`
  return { text, tone: qty <= 0 ? 'danger' : 'default' }
}

export function getProductStockDisplayValue(product: Product): string {
  if (isNonInventoryProduct(product, false)) return '—'
  if (!product.track_inventory) return '—'
  if (isMarkedSoldProduct(product, false)) return 'Sold (0)'
  return String(product.stock_qty)
}

export function getVariantStockDisplayValue(
  product: Product,
  variant: ProductVariant
): string {
  if (isNonInventoryVariant(product, variant, true)) return '—'
  if (!product.track_inventory) return '—'
  if (isMarkedSoldVariant(product, variant, true)) return 'Sold (0)'
  return String(variant.stock_qty)
}
