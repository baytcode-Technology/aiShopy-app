import { Platform } from 'react-native'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import { prepareUploadFile } from '@src/lib/prepare-upload-file'
import { env } from '@src/config/env'

export type LocalImageFile = {
  uri: string
  name: string
  type: string
}

export type UploadImagesResponse = {
  success: boolean
  message: string
  data: { urls: string[] }
}

export async function uploadProductImages(
  storeId: string,
  files: LocalImageFile[]
): Promise<string[]> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('You are not signed in')
  }

  const prepared = await Promise.all(
    files.map((file) => prepareUploadFile(file.uri, file.name, file.type))
  )

  const formData = new FormData()
  formData.append('store_id', storeId)

  for (const file of prepared) {
    if (Platform.OS === 'web' && (file.uri.startsWith('blob:') || file.uri.startsWith('data:'))) {
      const res = await fetch(file.uri)
      const blob = await res.blob()
      formData.append('images', blob, file.name)
    } else {
      formData.append('images', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob)
    }
  }

  const base = env.apiBaseUrl.replace(/\/$/, '')
  const url = `${base}${endpoints.uploadProductImages}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const text = await res.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'Image upload API is not available on the server. Redeploy the latest backend (POST /api/uploads/product-images).'
      )
    }
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error?: { message?: string } }).error?.message ?? res.statusText)
        : res.statusText
    throw new Error(message || `HTTP ${res.status}`)
  }

  const parsed = body as UploadImagesResponse
  return parsed.data.urls
}
