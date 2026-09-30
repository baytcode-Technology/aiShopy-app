import { Platform } from 'react-native'
import { apiFetch, authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { getAccessToken } from '@src/lib/auth-storage'
import {
  ALERTS_CHANNEL_ID,
  getExpoPushToken,
} from '@src/lib/push-notifications'
import type { DeletePushTokenPayload, UpsertPushTokenPayload } from '@src/types/notification-preferences'

export async function registerPlatformAdminPushToken(
  payload: UpsertPushTokenPayload
): Promise<void> {
  await authenticatedFetch(endpoints.platformAdminPushToken, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function unregisterPlatformAdminPushToken(
  payload: DeletePushTokenPayload
): Promise<void> {
  await authenticatedFetch(endpoints.platformAdminPushToken, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

export function currentPushPlatform(): UpsertPushTokenPayload['platform'] {
  if (Platform.OS === 'ios') return 'ios'
  if (Platform.OS === 'android') return 'android'
  return 'web'
}

export async function registerThisDeviceAsAdminPush(): Promise<boolean> {
  const token = await getExpoPushToken()
  if (!token) return false
  await registerPlatformAdminPushToken({
    expo_push_token: token,
    platform: currentPushPlatform(),
    sound_channel_id: ALERTS_CHANNEL_ID,
  })
  return true
}

/** Best-effort: works after setSigningOut(true) because it uses apiFetch + stored token. */
export async function unregisterThisDeviceAdminPush(): Promise<void> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return
    const token = await getExpoPushToken()
    if (!token) return
    await apiFetch(endpoints.platformAdminPushToken, {
      method: 'DELETE',
      token: accessToken,
      body: JSON.stringify({ expo_push_token: token }),
    })
  } catch {
    // Sign-out / disable must continue even if unregister fails.
  }
}
