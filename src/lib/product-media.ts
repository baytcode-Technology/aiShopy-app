import { Image } from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator'
import type { Product } from '@src/types/product'

export type ProductMediaItem = {
  id: string
  uri: string
  remoteUrl?: string
  pending?: { name: string; type: string }
}

export function mediaId() {
  return `media-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function productToMediaItems(product: Product): ProductMediaItem[] {
  const urls =
    product.images.length > 0
      ? product.images
      : product.thumbnail_url
        ? [product.thumbnail_url]
        : []

  return urls.map((url) => ({
    id: `remote-${url}`,
    uri: url,
    remoteUrl: url,
  }))
}

export function resolveThumbnailId(
  items: ProductMediaItem[],
  thumbnailUrl: string | null
): string | null {
  if (!thumbnailUrl || items.length === 0) return items[0]?.id ?? null
  const match = items.find((i) => i.uri === thumbnailUrl || i.remoteUrl === thumbnailUrl)
  return match?.id ?? items[0]?.id ?? null
}

export function thumbnailUrlFromItems(
  items: ProductMediaItem[],
  thumbnailId: string | null
): string | null {
  if (!thumbnailId) return items[0]?.remoteUrl ?? items[0]?.uri ?? null
  const item = items.find((i) => i.id === thumbnailId)
  return item?.remoteUrl ?? item?.uri ?? null
}

export async function cropImageToSquare(uri: string): Promise<string> {
  const { width, height } = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject)
    }
  )
  const size = Math.min(width, height)
  const originX = Math.round((width - size) / 2)
  const originY = Math.round((height - size) / 2)
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ crop: { originX, originY, width: size, height: size } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
  )
  return result.uri
}

/** Uploads pending items and returns ordered image URLs + thumbnail for product PATCH. */
export async function resolveProductMediaForSave(
  storeId: number,
  items: ProductMediaItem[],
  thumbnailId: string | null,
  upload: (
    storeId: number,
    files: { uri: string; name: string; type: string }[]
  ) => Promise<string[]>
): Promise<{ images: string[]; thumbnail_url: string }> {
  if (items.length === 0) {
    throw new Error('At least one product image is required')
  }

  const pending = items.filter((i) => i.pending)
  let uploaded: string[] = []
  if (pending.length > 0) {
    uploaded = await upload(
      storeId,
      pending.map((p) => ({
        uri: p.uri,
        name: p.pending!.name,
        type: p.pending!.type,
      }))
    )
  }

  const orderedUrls: string[] = []
  let uploadIdx = 0
  for (const item of items) {
    if (item.pending) {
      orderedUrls.push(uploaded[uploadIdx]!)
      uploadIdx += 1
    } else if (item.remoteUrl) {
      orderedUrls.push(item.remoteUrl)
    }
  }

  const thumbIndex = items.findIndex((i) => i.id === thumbnailId)
  const thumbnail_url = thumbIndex >= 0 ? orderedUrls[thumbIndex]! : orderedUrls[0]!

  return { images: orderedUrls, thumbnail_url }
}

export function mimeFromUri(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}
