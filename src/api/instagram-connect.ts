import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'

export type InstagramConnectResponse = {
  success: boolean
  message: string
  data: { url: string }
}

export type InstagramConnectionStatus = {
  connected: boolean
  ig_user_id: string | null
  ig_username: string | null
}

export type InstagramConnectionStatusResponse = {
  success: boolean
  message: string
  data: InstagramConnectionStatus
}

function qs(storeId: string) {
  return new URLSearchParams({ store_id: storeId }).toString()
}

export async function getInstagramConnectUrl(storeId: string): Promise<InstagramConnectResponse> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')
  return apiFetch<InstagramConnectResponse>(`${endpoints.instagramConnect}?${qs(storeId)}`, { token })
}

export async function fetchInstagramConnectionStatus(
  storeId: string
): Promise<InstagramConnectionStatusResponse> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')
  return apiFetch<InstagramConnectionStatusResponse>(
    `${endpoints.instagramConnectionStatus}?${qs(storeId)}`,
    { token }
  )
}

export async function subscribeInstagramWebhooks(storeId: string): Promise<{
  success: boolean
  message: string
}> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')
  return apiFetch(`${endpoints.instagramSubscribeWebhooks}?${qs(storeId)}`, {
    method: 'POST',
    token,
  })
}
