import { unregisterPushToken } from '@src/api/notification-preferences'
import { getExpoPushToken } from '@src/lib/push-notifications'
import { getStoreSession } from '@src/lib/store-storage'

/**
 * Best-effort removal of this device's push token from the backend.
 * Must run while auth tokens are still valid (before sign-out clears session).
 */
export async function unregisterDevicePushToken(): Promise<void> {
  try {
    const session = await getStoreSession()
    if (!session?.storeId) return

    const token = await getExpoPushToken()
    if (!token) return

    await unregisterPushToken(session.storeId, { expo_push_token: token })
  } catch {
    // Sign-out must continue even if unregister fails (offline, expired token, etc.).
  }
}
