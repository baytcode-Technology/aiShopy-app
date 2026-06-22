import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'

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

function qs(storeId: number) {
  return new URLSearchParams({ store_id: String(storeId) }).toString()
}

export async function getInstagramConnectUrl(storeId: number): Promise<InstagramConnectResponse> {
  return authenticatedFetch<InstagramConnectResponse>(
    `${endpoints.instagramConnect}?${qs(storeId)}`
  )
}

export async function fetchInstagramConnectionStatus(
  storeId: number
): Promise<InstagramConnectionStatusResponse> {
  return authenticatedFetch<InstagramConnectionStatusResponse>(
    `${endpoints.instagramConnectionStatus}?${qs(storeId)}`
  )
}

export async function subscribeInstagramWebhooks(storeId: number): Promise<{
  success: boolean
  message: string
}> {
  return authenticatedFetch(`${endpoints.instagramSubscribeWebhooks}?${qs(storeId)}`, {
    method: 'POST',
  })
}
