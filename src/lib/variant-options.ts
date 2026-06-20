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
  /** Local image picked before upload (create flow). */
  imageUri?: string | null
  imageName?: string
  imageType?: string
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
      imageUri: existing?.imageUri ?? null,
      imageName: existing?.imageName,
      imageType: existing?.imageType,
    }
  })
}

export function toCreateVariantPayload(
  v: GeneratedVariant,
  imageUrl?: string | null
): CreateProductVariantPayload {
  const compareTrimmed = v.compareAtPrice.trim()
  const compare_at_price = compareTrimmed ? Number(compareTrimmed) || null : null
  return {
    name: v.name,
    options: v.options,
    price_delta: Number(v.priceDelta) || 0,
    compare_at_price,
    stock_qty: Number(v.stockQty) || 0,
    sku: v.sku.trim() || undefined,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    is_active: true,
    sort_order: 0,
  }
}

type VariantLocalImage = {
  id: string | number
  imageUri?: string | null
  imageName?: string
  imageType?: string
}

export async function uploadLocalVariantImages(
  storeId: number,
  variants: VariantLocalImage[],
  upload: (
    storeId: number,
    files: { uri: string; name: string; type: string }[]
  ) => Promise<string[]>
): Promise<Map<string | number, string>> {
  const withImage = variants.filter((v) => v.imageUri)
  if (withImage.length === 0) return new Map()

  const urls = await upload(
    storeId,
    withImage.map((v) => ({
      uri: v.imageUri!,
      name: v.imageName ?? `variant-${v.id}.jpg`,
      type: v.imageType ?? 'image/jpeg',
    }))
  )

  const map = new Map<string | number, string>()
  withImage.forEach((v, i) => {
    const url = urls[i]
    if (url) map.set(v.id, url)
  })
  return map
}

export async function uploadVariantImagesForCreate(
  storeId: number,
  variants: GeneratedVariant[],
  upload: (
    storeId: number,
    files: { uri: string; name: string; type: string }[]
  ) => Promise<string[]>
): Promise<Map<string | number, string>> {
  return uploadLocalVariantImages(storeId, variants, upload)
}
