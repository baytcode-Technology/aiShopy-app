import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'

export type WhatsAppConnectResponse = {
  success: boolean
  message: string
  data: { url: string }
}

export type WhatsAppSyncJob = {
  id: string
  store_id: string
  sync_type: 'smb_app_state_sync' | 'history'
  request_id: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'declined'
  error_message: string | null
  started_at: string
  completed_at: string | null
}

export type WhatsAppConnectionStatus = {
  connected: boolean
  is_on_biz_app: boolean
  platform_type: string | null
  wa_phone_number_id: string | null
  wa_waba_id: string | null
  whatsapp_number: string | null
  sync_jobs: WhatsAppSyncJob[]
  sync_complete: boolean
}

export type WhatsAppConnectionStatusResponse = {
  success: boolean
  message: string
  data: WhatsAppConnectionStatus
}

export type WhatsAppTriggerSyncResponse = {
  success: boolean
  message: string
  data: unknown
}

function qs(storeId: string) {
  return new URLSearchParams({ store_id: storeId }).toString()
}

export async function getWhatsAppConnectUrl(storeId: string): Promise<WhatsAppConnectResponse> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')
  return apiFetch<WhatsAppConnectResponse>(`${endpoints.whatsappConnect}?${qs(storeId)}`, { token })
}

export async function fetchWhatsAppConnectionStatus(
  storeId: string
): Promise<WhatsAppConnectionStatusResponse> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')
  return apiFetch<WhatsAppConnectionStatusResponse>(
    `${endpoints.whatsappConnectionStatus}?${qs(storeId)}`,
    { token }
  )
}

export async function triggerWhatsAppSync(storeId: string): Promise<WhatsAppTriggerSyncResponse> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')
  return apiFetch<WhatsAppTriggerSyncResponse>(endpoints.whatsappSync, {
    method: 'POST',
    token,
    body: JSON.stringify({ storeId }),
  })
}
