import * as FileSystem from 'expo-file-system/legacy'
import * as ImageManipulator from 'expo-image-manipulator'
import { prepareUploadFile } from '@src/lib/prepare-upload-file'

const SUPPORTED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

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

  if (input.kind === 'image' && imageNeedsJpegConversion(type, uri, name)) {
    const converted = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.85,
      format: ImageManipulator.SaveFormat.JPEG,
    })
    uri = converted.uri
    name = jpegName(name)
    type = 'image/jpeg'
  }

  const fileInfo = await FileSystem.getInfoAsync(uri)
  if (!fileInfo.exists || !('size' in fileInfo) || !fileInfo.size) {
    throw new Error('Media file is missing or empty')
  }

  return { uri, name, type }
}
