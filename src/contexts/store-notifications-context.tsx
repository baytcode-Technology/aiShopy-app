import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import {
  fetchNotificationPreferences,
  registerPushToken,
} from '@src/api/notification-preferences'
import { navigateFromNotificationData } from '@src/lib/notification-navigation'
import {
  ALERTS_CHANNEL_ID,
  addNotificationResponseListener,
  getExpoPushToken,
  setupAndroidNotificationChannels,
} from '@src/lib/push-notifications'
import type { NotificationPreferences } from '@src/types/notification-preferences'

const DEFAULT_PREFS: NotificationPreferences = {
  chats: true,
  online_orders: true,
  pos_orders: true,
  sound_id: 'default',
}

type StoreNotificationsContextValue = {
  preferences: NotificationPreferences
  refreshPreferences: () => Promise<void>
}

const StoreNotificationsContext = createContext<StoreNotificationsContextValue | null>(null)

export function StoreNotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { store } = useStore()
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const initialNotificationHandled = useRef(false)

  const refreshPreferences = useCallback(async () => {
    if (!store?.id) return
    try {
      const res = await fetchNotificationPreferences(store.id)
      setPreferences(res.data.notification_preferences)
    } catch {
      // Keep last known prefs when offline.
    }
  }, [store?.id])

  useEffect(() => {
    if (!isAuthenticated || !store?.id) return
    void refreshPreferences()
  }, [isAuthenticated, store?.id, refreshPreferences])

  useEffect(() => {
    if (!isAuthenticated || !store?.id) return

    void setupAndroidNotificationChannels()

    void (async () => {
      try {
        const token = await getExpoPushToken()
        if (!token) return

        await registerPushToken(store.id, {
          expo_push_token: token,
          platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
          sound_channel_id: ALERTS_CHANNEL_ID,
        })
      } catch (err) {
        console.warn('[push] Could not register push token:', err)
      }
    })()
  }, [isAuthenticated, store?.id])

  useEffect(() => {
    if (!isAuthenticated || !store?.id) return

    return addNotificationResponseListener((data) => {
      navigateFromNotificationData(data)
    })
  }, [isAuthenticated, store?.id])

  useEffect(() => {
    if (!isAuthenticated || !store?.id || initialNotificationHandled.current) return

    void (async () => {
      const response = await Notifications.getLastNotificationResponseAsync()
      initialNotificationHandled.current = true

      const data = response?.notification.request.content.data
      if (data && typeof data === 'object') {
        navigateFromNotificationData(data as Record<string, unknown>)
      }
    })()
  }, [isAuthenticated, store?.id])

  const value = useMemo(
    () => ({
      preferences,
      refreshPreferences,
    }),
    [preferences, refreshPreferences]
  )

  return (
    <StoreNotificationsContext.Provider value={value}>
      {children}
    </StoreNotificationsContext.Provider>
  )
}

export function useStoreNotifications() {
  const ctx = useContext(StoreNotificationsContext)
  if (!ctx) {
    throw new Error('useStoreNotifications must be used within StoreNotificationsProvider')
  }
  return ctx
}
