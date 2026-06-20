import { Platform } from 'react-native'
import { ApiHttpError, getValidAccessToken } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { prepareUploadFile } from '@src/lib/prepare-upload-file'
import { refreshSession } from '@src/lib/session-manager'
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

async function uploadWithToken(
  storeId: number,
  prepared: Awaited<ReturnType<typeof prepareUploadFile>>[],
  token: string
): Promise<string[]> {
  const formData = new FormData()
  formData.append('store_id', String(storeId))

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
    throw new ApiHttpError(message || `HTTP ${res.status}`, res.status, body)
  }

  const parsed = body as UploadImagesResponse
  return parsed.data.urls
}

export async function uploadProductImages(
  storeId: number,
  files: LocalImageFile[]
): Promise<string[]> {
  const prepared = await Promise.all(
    files.map((file) => prepareUploadFile(file.uri, file.name, file.type))
  )

  const run = async (isRetry: boolean): Promise<string[]> => {
    const token = await getValidAccessToken()
    try {
      return await uploadWithToken(storeId, prepared, token)
    } catch (err) {
      if (err instanceof ApiHttpError && err.status === 401 && !isRetry) {
        const newToken = await refreshSession()
        return uploadWithToken(storeId, prepared, newToken)
      }
      throw err
    }
  }

  return run(false)
}
