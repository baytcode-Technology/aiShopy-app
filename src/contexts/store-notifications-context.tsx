import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import {
  fetchNotificationPreferences,
  registerPushToken,
} from '@src/api/notification-preferences'
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

  const refreshPreferences = useCallback(async () => {
    if (!store?.id) return
    try {
      const res = await fetchNotificationPreferences()
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

        await registerPushToken({
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
    return addNotificationResponseListener((data) => {
      const type = typeof data.type === 'string' ? data.type : ''
      if (type === 'chat') {
        const conversationId =
          typeof data.conversationId === 'string' ? data.conversationId : null
        const channel = typeof data.channel === 'string' ? data.channel : 'whatsapp'
        if (conversationId) {
          router.push(`/(store)/chats/${conversationId}?channel=${channel}` as never)
        } else {
          router.push('/(store)/chats' as never)
        }
        return
      }

      if (type === 'order') {
        const orderId = typeof data.orderId === 'string' ? data.orderId : null
        if (orderId) {
          router.push(`/(store)/orders/${orderId}` as never)
        } else {
          router.push('/(store)/orders' as never)
        }
      }
    })
  }, [])

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
