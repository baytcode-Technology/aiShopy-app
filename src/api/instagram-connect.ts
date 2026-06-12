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

function qs(storeId: string) {
  return new URLSearchParams({ store_id: storeId }).toString()
}

export async function getInstagramConnectUrl(storeId: string): Promise<InstagramConnectResponse> {
  return authenticatedFetch<InstagramConnectResponse>(
    `${endpoints.instagramConnect}?${qs(storeId)}`
  )
}

export async function fetchInstagramConnectionStatus(
  storeId: string
): Promise<InstagramConnectionStatusResponse> {
  return authenticatedFetch<InstagramConnectionStatusResponse>(
    `${endpoints.instagramConnectionStatus}?${qs(storeId)}`
  )
}

export async function subscribeInstagramWebhooks(storeId: string): Promise<{
  success: boolean
  message: string
}> {
  return authenticatedFetch(`${endpoints.instagramSubscribeWebhooks}?${qs(storeId)}`, {
    method: 'POST',
  })
}
