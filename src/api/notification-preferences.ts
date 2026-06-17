import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import type {
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesPayload,
  UpsertPushTokenPayload,
} from '@src/types/notification-preferences'

export async function fetchNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  return authenticatedFetch<NotificationPreferencesResponse>(endpoints.notificationPreferences)
}

export async function updateNotificationPreferences(
  payload: UpdateNotificationPreferencesPayload
): Promise<NotificationPreferencesResponse> {
  return authenticatedFetch<NotificationPreferencesResponse>(endpoints.notificationPreferences, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function registerPushToken(payload: UpsertPushTokenPayload): Promise<void> {
  await authenticatedFetch(endpoints.pushToken, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
