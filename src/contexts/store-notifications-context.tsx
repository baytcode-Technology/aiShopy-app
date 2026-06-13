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
import { AppState, Platform } from 'react-native'
import { router, usePathname } from 'expo-router'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { useChatSocket } from '@src/contexts/chat-socket-context'
import {
  fetchNotificationPreferences,
  registerPushToken,
} from '@src/api/notification-preferences'
import { androidChannelIdForSound } from '@src/lib/notification-sounds'
import {
  addNotificationResponseListener,
  getExpoPushToken,
  presentLocalNotification,
  setupAndroidNotificationChannels,
} from '@src/lib/push-notifications'
import type { NotificationPreferences } from '@src/types/notification-preferences'
import type { SocketOrderNewPayload } from '@src/lib/socket'

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
  const pathname = usePathname()
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const prefsRef = useRef(preferences)
  const pathnameRef = useRef(pathname)

  const { onMessageNew, onInstagramMessageNew, onOrderNew } = useChatSocket()

  useEffect(() => {
    prefsRef.current = preferences
  }, [preferences])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

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
      const token = await getExpoPushToken()
      if (!token) return

      await registerPushToken({
        expo_push_token: token,
        platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
        sound_channel_id: androidChannelIdForSound(prefsRef.current.sound_id),
      })
    })()
  }, [isAuthenticated, store?.id, preferences.sound_id])

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

  useEffect(() => {
    return onMessageNew((payload) => {
      if (AppState.currentState !== 'active') return
      if (!prefsRef.current.chats) return
      if (payload.message.direction !== 'inbound') return
      if (pathnameRef.current.includes(payload.conversationId)) return

      void presentLocalNotification({
        title: 'WhatsApp',
        body: `${payload.message.from_number}: ${payload.message.text_body ?? '[message]'}`,
        soundId: prefsRef.current.sound_id,
        data: {
          type: 'chat',
          channel: 'whatsapp',
          conversationId: payload.conversationId,
        },
      })
    })
  }, [onMessageNew])

  useEffect(() => {
    return onInstagramMessageNew((payload) => {
      if (AppState.currentState !== 'active') return
      if (!prefsRef.current.chats) return
      if (payload.message.direction !== 'inbound') return
      if (pathnameRef.current.includes(payload.conversationId)) return

      void presentLocalNotification({
        title: 'Instagram',
        body: payload.message.text_body ?? 'New message',
        soundId: prefsRef.current.sound_id,
        data: {
          type: 'chat',
          channel: 'instagram',
          conversationId: payload.conversationId,
        },
      })
    })
  }, [onInstagramMessageNew])

  useEffect(() => {
    return onOrderNew((payload: SocketOrderNewPayload) => {
      if (AppState.currentState !== 'active') return
      const source = payload.order.source
      if (source === 'storefront') {
        if (!prefsRef.current.online_orders) return
      } else if (source === 'offline') {
        if (!prefsRef.current.pos_orders) return
      } else {
        return
      }

      const label = source === 'storefront' ? 'New online order' : 'POS order'
      const total = `${payload.order.currency} ${Number(payload.order.total).toFixed(2)}`

      void presentLocalNotification({
        title: payload.order.store_slug,
        body: `${label} · ${payload.order.order_number} · ${total}`,
        soundId: prefsRef.current.sound_id,
        data: {
          type: 'order',
          orderId: payload.order.id,
          orderNumber: payload.order.order_number,
          source: payload.order.source,
        },
      })
    })
  }, [onOrderNew])

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
