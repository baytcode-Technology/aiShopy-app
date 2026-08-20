import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { storeIdQuery } from '@src/api/stores'
import { getAccessToken } from '@src/lib/auth-storage'
import { getExpoPushToken, setPushAlertsEnabled } from '@src/lib/push-notifications'
import { getStoreSession } from '@src/lib/store-storage'

/**
 * Best-effort removal of this device's push token from the backend.
 * Uses apiFetch + stored access token so it still works after setSigningOut(true)
 * (authenticatedFetch would abort with SigningOutAbortError).
 * Must run before clearTokens() / clearStore().
 */
export async function unregisterDevicePushToken(): Promise<void> {
  setPushAlertsEnabled(false)

  try {
    const session = await getStoreSession()
    if (!session?.storeId) return

    const accessToken = await getAccessToken()
    if (!accessToken) return

    const token = await getExpoPushToken()
    if (!token) return

    await apiFetch(`${endpoints.pushToken}${storeIdQuery(session.storeId)}`, {
      method: 'DELETE',
      token: accessToken,
      body: JSON.stringify({ expo_push_token: token }),
    })
  } catch {
    // Sign-out must continue even if unregister fails (offline, expired token, etc.).
  }
}
