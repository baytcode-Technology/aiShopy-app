import type { CreateProductVariantPayload } from '@src/types/product'

export type VariantOption = {
  id: string
  name: string
  values: string[]
}

export type GeneratedVariant = {
  id: string
  name: string
  options: Record<string, string>
  priceDelta: string
  compareAtPrice: string
  stockQty: string
  sku: string
}

function cartesian(options: VariantOption[]): Record<string, string>[] {
  const active = options.filter((o) => o.name.trim() && o.values.some((v) => v.trim()))
  if (active.length === 0) return []

  return active.reduce<Record<string, string>[]>(
    (acc, option) => {
      const values = option.values.map((v) => v.trim()).filter(Boolean)
      if (values.length === 0) return acc
      const next: Record<string, string>[] = []
      for (const combo of acc.length ? acc : [{}]) {
        for (const value of values) {
          next.push({ ...combo, [option.name.trim()]: value })
        }
      }
      return next
    },
    []
  )
}

export function generateVariantsFromOptions(
  options: VariantOption[],
  previous: GeneratedVariant[] = []
): GeneratedVariant[] {
  const combos = cartesian(options)
  if (combos.length === 0) return []

  return combos.map((opts, index) => {
    const name = Object.values(opts).join(' / ')
    const key = JSON.stringify(opts)
    const existing = previous.find((p) => JSON.stringify(p.options) === key)
    return {
      id: existing?.id ?? `gen-${index}-${Date.now()}`,
      name,
      options: opts,
      priceDelta: existing?.priceDelta ?? '0',
      compareAtPrice: existing?.compareAtPrice ?? '',
      stockQty: existing?.stockQty ?? '0',
      sku: existing?.sku ?? '',
    }
  })
}

export function toCreateVariantPayload(v: GeneratedVariant): CreateProductVariantPayload {
  const compareTrimmed = v.compareAtPrice.trim()
  const compare_at_price = compareTrimmed ? Number(compareTrimmed) || null : null
  return {
    name: v.name,
    options: v.options,
    price_delta: Number(v.priceDelta) || 0,
    compare_at_price,
    stock_qty: Number(v.stockQty) || 0,
    sku: v.sku.trim() || undefined,
    is_active: true,
    sort_order: 0,
  }
}
