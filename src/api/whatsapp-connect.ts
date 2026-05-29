import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'

export type WhatsAppConnectResponse = {
  success: boolean
  message: string
  data: { url: string }
}

export async function getWhatsAppConnectUrl(storeId: string): Promise<WhatsAppConnectResponse> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')
  const qs = new URLSearchParams({ store_id: storeId }).toString()
  return apiFetch<WhatsAppConnectResponse>(`${endpoints.whatsappConnect}?${qs}`, { token })
}

