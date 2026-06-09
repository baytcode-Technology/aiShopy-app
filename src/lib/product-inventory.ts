import type { Product, ProductVariant } from '@src/types/product'

export function isNonInventoryProduct(product: Product): boolean {
  return product.mark_as_non_inventory === true
}

export function isMarkedSoldProduct(product: Product): boolean {
  return product.mark_as_sold === true
}

export function isNonInventoryVariant(product: Product, variant: ProductVariant): boolean {
  if (isNonInventoryProduct(product)) return true
  return variant.mark_as_non_inventory === true
}

export function isMarkedSoldVariant(product: Product, variant: ProductVariant): boolean {
  if (isMarkedSoldProduct(product)) return true
  return variant.mark_as_sold === true
}

export function productInventoryFlagsLocked(product: Product): boolean {
  return isMarkedSoldProduct(product) || isNonInventoryProduct(product)
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
  return product.track_inventory && !isNonInventoryProduct(product)
}

export function tracksVariantStock(product: Product, variant: ProductVariant): boolean {
  return product.track_inventory && !isNonInventoryVariant(product, variant)
}

export function effectiveProductStockQty(product: Product): number {
  if (isMarkedSoldProduct(product)) return 0
  return product.stock_qty
}

export function effectiveVariantStockQty(product: Product, variant: ProductVariant): number {
  if (isMarkedSoldVariant(product, variant)) return 0
  return variant.stock_qty
}

export type ProductStockLabel = {
  text: string
  tone: 'default' | 'danger' | 'muted'
}

export function getProductStockLabel(product: Product): ProductStockLabel | null {
  if (isNonInventoryProduct(product)) {
    return { text: 'No inventory tracking', tone: 'muted' }
  }
  if (!product.track_inventory) return null
  if (isMarkedSoldProduct(product)) {
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
  if (isNonInventoryVariant(product, variant)) {
    return isNonInventoryProduct(product)
      ? null
      : { text: 'No inventory tracking', tone: 'muted' }
  }
  if (!product.track_inventory) return null
  if (isMarkedSoldVariant(product, variant)) {
    return { text: 'Sold · 0 available', tone: 'danger' }
  }
  const qty = variant.stock_qty
  const text = qty === 1 ? '1 available' : `${qty} available`
  return { text, tone: qty <= 0 ? 'danger' : 'default' }
}

/**
 * Variant card labels: parent flags always win. When parent has sold or
 * non-inventory on, only that parent flag is shown (variant flags hidden).
 */
export function getVariantCardInventoryFlags(
  product: Product,
  variant: ProductVariant
): { showSoldOut: boolean; showNonInventory: boolean } {
  if (isMarkedSoldProduct(product)) {
    return { showSoldOut: true, showNonInventory: false }
  }
  if (isNonInventoryProduct(product)) {
    return { showSoldOut: false, showNonInventory: true }
  }
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
  if (isNonInventoryVariant(product, variant)) return null
  if (!product.track_inventory) return null
  const qty = effectiveVariantStockQty(product, variant)
  const text = qty === 1 ? '1 available' : `${qty} available`
  return { text, tone: qty <= 0 ? 'danger' : 'default' }
}

export function getProductStockDisplayValue(product: Product): string {
  if (isNonInventoryProduct(product)) return '—'
  if (!product.track_inventory) return '—'
  if (isMarkedSoldProduct(product)) return 'Sold (0)'
  return String(product.stock_qty)
}

export function getVariantStockDisplayValue(
  product: Product,
  variant: ProductVariant
): string {
  if (isNonInventoryVariant(product, variant)) return '—'
  if (!product.track_inventory) return '—'
  if (isMarkedSoldVariant(product, variant)) return 'Sold (0)'
  return String(variant.stock_qty)
}
