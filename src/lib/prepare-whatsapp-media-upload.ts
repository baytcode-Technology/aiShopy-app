import * as FileSystem from 'expo-file-system/legacy'
import * as ImageManipulator from 'expo-image-manipulator'
import { Image } from 'react-native'
import { prepareUploadFile } from '@src/lib/prepare-upload-file'

const SUPPORTED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

/** WhatsApp-friendly max edge; full camera photos must be downscaled on device. */
const WHATSAPP_IMAGE_MAX_EDGE = 1600
const WHATSAPP_IMAGE_TARGET_MAX_BYTES = 4 * 1024 * 1024

function normalizePathUri(uri: string): string {
  const trimmed = uri.trim()
  if (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('ph://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed
  }
  if (trimmed.startsWith('/')) {
    return `file://${trimmed}`
  }
  return trimmed
}

function imageNeedsJpegConversion(mime: string, uri: string, name: string): boolean {
  const blob = `${mime} ${uri} ${name}`.toLowerCase()
  if (blob.includes('heic') || blob.includes('heif')) return true

  const baseMime = mime.split(';')[0]?.trim().toLowerCase() ?? ''
  if (!baseMime || baseMime === 'application/octet-stream') {
    return !/\.(jpe?g|png|webp|gif)(\?|$)/i.test(`${uri} ${name}`)
  }

  return !SUPPORTED_IMAGE_MIMES.has(baseMime)
}

function jpegName(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, '') || `image-${Date.now()}`
  return `${base}.jpg`
}

function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    )
  })
}

function resizeActionsForDimensions(
  width: number,
  height: number,
): ImageManipulator.Action[] {
  const max = WHATSAPP_IMAGE_MAX_EDGE
  if (width <= max && height <= max) return []
  if (width >= height) return [{ resize: { width: max } }]
  return [{ resize: { height: max } }]
}

async function getFileSize(uri: string): Promise<number> {
  const fileInfo = await FileSystem.getInfoAsync(uri)
  if (!fileInfo.exists) return 0
  return 'size' in fileInfo && typeof fileInfo.size === 'number' ? fileInfo.size : 0
}

async function optimizeImageForWhatsApp(
  uri: string,
  name: string,
  type: string,
): Promise<{ uri: string; name: string; type: string }> {
  let actions: ImageManipulator.Action[] = []
  try {
    const { width, height } = await getImageDimensions(uri)
    actions = resizeActionsForDimensions(width, height)
  } catch {
    actions = [{ resize: { width: WHATSAPP_IMAGE_MAX_EDGE } }]
  }

  const needsJpeg = imageNeedsJpegConversion(type, uri, name)
  const sourceSize = await getFileSize(uri)
  const needsShrink =
    sourceSize > WHATSAPP_IMAGE_TARGET_MAX_BYTES ||
    actions.length > 0 ||
    needsJpeg

  if (!needsShrink) {
    return { uri, name, type }
  }

  let compress = 0.82
  let outputUri = uri
  let outputName = jpegName(name)

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const converted = await ImageManipulator.manipulateAsync(uri, actions, {
      compress,
      format: ImageManipulator.SaveFormat.JPEG,
    })
    outputUri = converted.uri
    outputName = jpegName(name)

    const outputSize = await getFileSize(outputUri)
    if (outputSize > 0 && outputSize <= WHATSAPP_IMAGE_TARGET_MAX_BYTES) {
      return { uri: outputUri, name: outputName, type: 'image/jpeg' }
    }

    if (!actions.length) {
      actions = [{ resize: { width: WHATSAPP_IMAGE_MAX_EDGE } }]
    }
    compress = Math.max(0.45, compress - 0.12)
  }

  const finalSize = await getFileSize(outputUri)
  if (finalSize === 0) {
    throw new Error('Media file is missing or empty')
  }

  return { uri: outputUri, name: outputName, type: 'image/jpeg' }
}

export async function prepareWhatsAppMediaUpload(input: {
  kind: 'image' | 'audio' | 'video'
  uri: string
  name: string
  type: string
}): Promise<{ uri: string; name: string; type: string }> {
  const prepared = await prepareUploadFile(
    normalizePathUri(input.uri),
    input.name,
    input.type,
  )

  let uri = prepared.uri
  let name = prepared.name
  let type = prepared.type

  if (input.kind === 'image') {
    const optimized = await optimizeImageForWhatsApp(uri, name, type)
    uri = optimized.uri
    name = optimized.name
    type = optimized.type
  }

  const fileSize = await getFileSize(uri)
  if (fileSize === 0) {
    throw new Error('Media file is missing or empty')
  }

  return { uri, name, type }
}
