import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { storeIdQuery } from '@src/api/stores'
import type {
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesPayload,
  UpsertPushTokenPayload,
} from '@src/types/notification-preferences'

export async function fetchNotificationPreferences(
  storeId: number
): Promise<NotificationPreferencesResponse> {
  return authenticatedFetch<NotificationPreferencesResponse>(
    `${endpoints.notificationPreferences}${storeIdQuery(storeId)}`
  )
}

export async function updateNotificationPreferences(
  storeId: number,
  payload: UpdateNotificationPreferencesPayload
): Promise<NotificationPreferencesResponse> {
  return authenticatedFetch<NotificationPreferencesResponse>(
    `${endpoints.notificationPreferences}${storeIdQuery(storeId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  )
}

export async function registerPushToken(
  storeId: number,
  payload: UpsertPushTokenPayload
): Promise<void> {
  await authenticatedFetch(`${endpoints.pushToken}${storeIdQuery(storeId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
