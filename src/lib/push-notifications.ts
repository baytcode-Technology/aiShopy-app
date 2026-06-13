import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { AppState, Platform, type AppStateStatus } from 'react-native'
import Constants from 'expo-constants'
import {
  androidChannelIdForSound,
  NOTIFICATION_SOUNDS,
  soundFileNameForId,
} from '@src/lib/notification-sounds'
import type { NotificationSoundId } from '@src/types/notification-preferences'

let appState: AppStateStatus = AppState.currentState
AppState.addEventListener('change', (next) => {
  appState = next
})

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: appState !== 'active',
    shouldPlaySound: appState !== 'active',
    shouldSetBadge: true,
    shouldShowBanner: appState !== 'active',
    shouldShowList: appState !== 'active',
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

  for (const sound of NOTIFICATION_SOUNDS) {
    await Notifications.setNotificationChannelAsync(androidChannelIdForSound(sound.id), {
      name: `AiShopy ${sound.label}`,
      importance: Notifications.AndroidImportance.HIGH,
      sound: soundFileNameForId(sound.id),
      vibrationPattern: [0, 250, 120, 250],
      lightColor: '#0a0a0b',
    })
  }
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

  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  return token.data
}

export async function presentLocalNotification(input: {
  title: string
  body: string
  soundId: NotificationSoundId
  data?: Record<string, string>
}): Promise<void> {
  const channelId = androidChannelIdForSound(input.soundId)

  await Notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body,
      sound: soundFileNameForId(input.soundId),
      data: input.data,
      ...(Platform.OS === 'android' ? { channelId } : {}),
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
