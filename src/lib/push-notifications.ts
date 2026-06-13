import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

/** Single Android channel — uses the phone default notification sound. */
export const ALERTS_CHANNEL_ID = 'aishopy-alerts'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false

  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true

  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted
}

export async function setupAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return

  await Notifications.setNotificationChannelAsync(ALERTS_CHANNEL_ID, {
    name: 'AiShopy alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 120, 250],
    lightColor: '#0a0a0b',
  })
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null

  const granted = await ensureNotificationPermissions()
  if (!granted) return null

  await setupAndroidNotificationChannels()

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  if (!projectId) {
    console.warn('[push] Missing EAS projectId')
    return null
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId })
    return token.data
  } catch (err) {
    console.warn('[push] Expo push token unavailable (FCM not configured):', err)
    return null
  }
}

export async function presentLocalNotification(input: {
  title: string
  body: string
  data?: Record<string, string>
}): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body,
      sound: 'default',
      data: input.data,
      ...(Platform.OS === 'android' ? { channelId: ALERTS_CHANNEL_ID } : {}),
    },
    trigger: null,
  })
}

export function addNotificationResponseListener(
  handler: (data: Record<string, unknown>) => void
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data
    if (data && typeof data === 'object') {
      handler(data as Record<string, unknown>)
    }
  })
  return () => sub.remove()
}
