import { getValidAccessToken } from '@src/api/client'
import { env } from '@src/config/env'

export function buildWhatsAppMediaUrl(mediaId: string, storeId: number): string {
  const base = env.apiBaseUrl.replace(/\/$/, '')
  const qs = new URLSearchParams({ store_id: String(storeId) }).toString()
  return `${base}/api/whatsapp/media/${encodeURIComponent(mediaId)}?${qs}`
}

export function mediaUrlRequiresAuth(uri: string): boolean {
  return uri.includes('/api/whatsapp/media/')
}

export async function getWhatsAppMediaAuthHeaders(): Promise<Record<string, string>> {
  const token = await getValidAccessToken()
  return { Authorization: `Bearer ${token}` }
}
