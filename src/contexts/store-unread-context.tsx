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
import { fetchOrders, markOrderViewed as markOrderViewedApi } from '@src/api/orders'
import { fetchAllChats, markChatRead as markChatReadApi } from '@src/api/chats'
import {
  fetchSupportUnread,
  markSupportRead as markSupportReadApi,
} from '@src/api/support'
import { useChatSocket } from '@src/contexts/chat-socket-context'
import { useStore } from '@src/contexts/store-context'
import { addNotificationReceivedListener } from '@src/lib/push-notifications'
import { showError } from '@src/lib/toast'
import type { ChatChannel, ChatListItem } from '@src/types/chat'
import type { Order } from '@src/types/order'

const CHAT_REFRESH_DEBOUNCE_MS = 300
const MARK_CHAT_READ_DEBOUNCE_MS = 500
const SUPPORT_UNREAD_POLL_MS = 4000

type ActiveChat = { conversationId: number; channel: ChatChannel }

type StoreUnreadContextValue = {
  ordersUnreadCount: number
  chatsUnreadCount: number
  supportUnreadCount: number
  supportUnreadPreview: string | null
  syncOrdersUnread: (orders: Order[]) => void
  syncChatsUnread: (items: ChatListItem[]) => void
  refreshOrdersUnread: () => Promise<void>
  refreshChatsUnread: () => Promise<void>
  refreshSupportUnread: () => Promise<void>
  isOrderUnviewed: (order: Order) => boolean
  onOrderViewed: (handler: (orderId: number) => void) => () => void
  onChatsInvalidate: (handler: () => void) => () => void
  onActiveChatMessage: (handler: (conversationId: number) => void) => () => void
  setActiveChat: (chat: ActiveChat | null) => void
  setActiveSupportChat: (conversationId: number | null) => void
  isActiveChat: (conversationId: number) => boolean
  markOrderViewed: (orderId: number) => Promise<void>
  markChatRead: (conversationId: number, channel: ChatChannel) => Promise<void>
  markSupportRead: (conversationId: number) => Promise<void>
}

const StoreUnreadContext = createContext<StoreUnreadContextValue | null>(null)

function countUnviewedOrders(orders: Order[], viewedOrderIds: Set<number>): number {
  return orders.filter((o) => !o.merchant_viewed_at && !viewedOrderIds.has(o.id)).length
}

export function StoreUnreadProvider({ children }: { children: ReactNode }) {
  const { store } = useStore()
  const {
    onOrderNew,
    onMessageNew,
    onInstagramMessageNew,
    onConversationUpdated,
    onInstagramConversationUpdated,
  } = useChatSocket()
  const [ordersUnreadCount, setOrdersUnreadCount] = useState(0)
  const [chatsUnreadCount, setChatsUnreadCount] = useState(0)
  const [supportUnreadCount, setSupportUnreadCount] = useState(0)
  const [supportUnreadPreview, setSupportUnreadPreview] = useState<string | null>(null)
  const [viewedOrderIds, setViewedOrderIds] = useState<Set<number>>(() => new Set())
  const orderViewedListeners = useRef(new Set<(orderId: number) => void>())
  const chatsInvalidateListeners = useRef(new Set<() => void>())
  const activeChatMessageListeners = useRef(new Set<(conversationId: number) => void>())
  const markingOrderIds = useRef(new Set<number>())
  const chatRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markChatReadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeChatRef = useRef<ActiveChat | null>(null)
  const activeSupportChatRef = useRef<number | null>(null)
  const waIgUnreadRef = useRef(0)

  const isOrderUnviewed = useCallback(
    (order: Order) => !order.merchant_viewed_at && !viewedOrderIds.has(order.id),
    [viewedOrderIds]
  )

  const syncOrdersUnread = useCallback(
    (orders: Order[]) => {
      setOrdersUnreadCount(countUnviewedOrders(orders, viewedOrderIds))
    },
    [viewedOrderIds]
  )

  const syncChatsUnread = useCallback((items: ChatListItem[]) => {
    const activeId = activeChatRef.current?.conversationId
    const waIgCount = items.filter((c) => c.unread > 0 && c.id !== activeId).length
    waIgUnreadRef.current = waIgCount
    setChatsUnreadCount(waIgCount + supportUnreadCount)
  }, [supportUnreadCount])

  const applySupportUnread = useCallback((count: number, preview: string | null) => {
    const activeId = activeSupportChatRef.current
    const effectiveCount = activeId != null ? 0 : count
    setSupportUnreadCount(effectiveCount)
    setSupportUnreadPreview(preview)
    setChatsUnreadCount(waIgUnreadRef.current + effectiveCount)
  }, [])

  const refreshOrdersUnread = useCallback(async () => {
    if (!store?.id) return
    try {
      const res = await fetchOrders(store.id)
      setOrdersUnreadCount(countUnviewedOrders(res.data.orders, viewedOrderIds))
    } catch {
      // List screens surface fetch errors; keep last known count here.
    }
  }, [store?.id, viewedOrderIds])

  const refreshChatsUnread = useCallback(async () => {
    if (!store?.id) return
    try {
      const { whatsapp, instagram } = await fetchAllChats(store.id)
      const activeId = activeChatRef.current?.conversationId
      const waIgCount = [...whatsapp, ...instagram].filter(
        (c) => (c.unread_count ?? 0) > 0 && c.id !== activeId
      ).length
      waIgUnreadRef.current = waIgCount
      setChatsUnreadCount(waIgCount + supportUnreadCount)
    } catch {
      // Keep last known count.
    }
  }, [store?.id, supportUnreadCount])

  const refreshSupportUnread = useCallback(async () => {
    if (!store?.id) return
    try {
      const res = await fetchSupportUnread(store.id)
      applySupportUnread(res.data.unread_count, res.data.last_preview)
    } catch {
      // Keep last known count.
    }
  }, [store?.id, applySupportUnread])

  const setActiveChat = useCallback((chat: ActiveChat | null) => {
    activeChatRef.current = chat
  }, [])

  const setActiveSupportChat = useCallback((conversationId: number | null) => {
    activeSupportChatRef.current = conversationId
    if (conversationId != null) {
      applySupportUnread(0, null)
    } else {
      void refreshSupportUnread()
    }
  }, [applySupportUnread, refreshSupportUnread])

  const isActiveChat = useCallback((conversationId: number) => {
    return activeChatRef.current?.conversationId === conversationId
  }, [])

  const invalidateChats = useCallback(() => {
    chatsInvalidateListeners.current.forEach((handler) => handler())
  }, [])

  const notifyActiveChatMessage = useCallback((conversationId: number) => {
    activeChatMessageListeners.current.forEach((handler) => handler(conversationId))
  }, [])

  const markSupportRead = useCallback(
    async (conversationId: number) => {
      if (!store?.id) return
      try {
        const res = await markSupportReadApi(store.id, conversationId)
        applySupportUnread(
          res.data.summary.unread_count,
          res.data.summary.last_preview
        )
      } catch {
        // Keep last known count.
      }
    },
    [store?.id, applySupportUnread]
  )

  const markChatRead = useCallback(
    async (conversationId: number, channel: ChatChannel) => {
      if (!store?.id) return
      try {
        await markChatReadApi({ storeId: store.id, conversationId, channel })
        await refreshChatsUnread()
      } catch {
        // Socket update may still clear row unread.
      }
    },
    [store?.id, refreshChatsUnread]
  )

  const scheduleMarkChatRead = useCallback(
    (conversationId: number, channel: ChatChannel) => {
      if (markChatReadTimer.current) {
        clearTimeout(markChatReadTimer.current)
      }
      markChatReadTimer.current = setTimeout(() => {
        markChatReadTimer.current = null
        void markChatRead(conversationId, channel)
      }, MARK_CHAT_READ_DEBOUNCE_MS)
    },
    [markChatRead]
  )

  const scheduleChatsRefresh = useCallback(
    (conversationId?: number) => {
      const active = activeChatRef.current
      if (conversationId && active?.conversationId === conversationId) {
        notifyActiveChatMessage(conversationId)
        scheduleMarkChatRead(conversationId, active.channel)
        return
      }

      invalidateChats()
      if (chatRefreshTimer.current) {
        clearTimeout(chatRefreshTimer.current)
      }
      chatRefreshTimer.current = setTimeout(() => {
        chatRefreshTimer.current = null
        void refreshChatsUnread()
      }, CHAT_REFRESH_DEBOUNCE_MS)
    },
    [invalidateChats, refreshChatsUnread, scheduleMarkChatRead, notifyActiveChatMessage]
  )

  const onOrderViewed = useCallback((handler: (orderId: number) => void) => {
    orderViewedListeners.current.add(handler)
    return () => {
      orderViewedListeners.current.delete(handler)
    }
  }, [])

  const onChatsInvalidate = useCallback((handler: () => void) => {
    chatsInvalidateListeners.current.add(handler)
    return () => {
      chatsInvalidateListeners.current.delete(handler)
    }
  }, [])

  const onActiveChatMessage = useCallback((handler: (conversationId: number) => void) => {
    activeChatMessageListeners.current.add(handler)
    return () => {
      activeChatMessageListeners.current.delete(handler)
    }
  }, [])

  useEffect(() => {
    if (!store?.id) {
      setOrdersUnreadCount(0)
      setChatsUnreadCount(0)
      setSupportUnreadCount(0)
      setSupportUnreadPreview(null)
      setViewedOrderIds(new Set())
      activeChatRef.current = null
      activeSupportChatRef.current = null
      waIgUnreadRef.current = 0
      return
    }
    void refreshOrdersUnread()
    void refreshChatsUnread()
    void refreshSupportUnread()
  }, [store?.id, refreshOrdersUnread, refreshChatsUnread, refreshSupportUnread])

  useEffect(() => {
    if (!store?.id) return

    const interval = setInterval(() => {
      void refreshSupportUnread()
    }, SUPPORT_UNREAD_POLL_MS)

    return () => clearInterval(interval)
  }, [store?.id, refreshSupportUnread])

  useEffect(() => {
    const unsub = onOrderNew(() => {
      setOrdersUnreadCount((c) => c + 1)
    })
    return unsub
  }, [onOrderNew])

  useEffect(() => {
    const unsubWaMessage = onMessageNew((payload) => {
      scheduleChatsRefresh(payload.conversationId)
    })
    const unsubIgMessage = onInstagramMessageNew((payload) => {
      scheduleChatsRefresh(payload.conversationId)
    })
    const unsubWaConversation = onConversationUpdated((payload) => {
      scheduleChatsRefresh(payload.conversation.id)
    })
    const unsubIgConversation = onInstagramConversationUpdated((payload) => {
      scheduleChatsRefresh(payload.conversation.id)
    })

    return () => {
      unsubWaMessage()
      unsubIgMessage()
      unsubWaConversation()
      unsubIgConversation()
    }
  }, [
    onMessageNew,
    onInstagramMessageNew,
    onConversationUpdated,
    onInstagramConversationUpdated,
    scheduleChatsRefresh,
  ])

  useEffect(() => {
    if (!store?.id) return

    return addNotificationReceivedListener((data) => {
      if (data.type === 'support' || data.channel === 'support') {
        void refreshSupportUnread()
        return
      }
      if (data.type === 'chat') {
        const conversationId =
          typeof data.conversationId === 'number'
            ? data.conversationId
            : typeof data.conversationId === 'string'
              ? Number(data.conversationId)
              : undefined
        scheduleChatsRefresh(
          conversationId != null && Number.isFinite(conversationId)
            ? conversationId
            : undefined
        )
      }
    })
  }, [store?.id, scheduleChatsRefresh])

  useEffect(() => {
    return () => {
      if (chatRefreshTimer.current) {
        clearTimeout(chatRefreshTimer.current)
      }
      if (markChatReadTimer.current) {
        clearTimeout(markChatReadTimer.current)
      }
    }
  }, [])

  const markOrderViewed = useCallback(
    async (orderId: number) => {
      if (!store?.id) return
      if (viewedOrderIds.has(orderId) || markingOrderIds.current.has(orderId)) return

      markingOrderIds.current.add(orderId)
      setViewedOrderIds((prev) => new Set(prev).add(orderId))
      setOrdersUnreadCount((c) => Math.max(0, c - 1))

      try {
        await markOrderViewedApi(store.id, orderId)
        orderViewedListeners.current.forEach((handler) => handler(orderId))
        const res = await fetchOrders(store.id)
        setOrdersUnreadCount(
          countUnviewedOrders(
            res.data.orders,
            new Set([...viewedOrderIds, orderId])
          )
        )
      } catch (e) {
        setViewedOrderIds((prev) => {
          const next = new Set(prev)
          next.delete(orderId)
          return next
        })
        setOrdersUnreadCount((c) => c + 1)
        showError(e, 'Could not mark order as read')
      } finally {
        markingOrderIds.current.delete(orderId)
      }
    },
    [store?.id, viewedOrderIds]
  )

  const value = useMemo(
    () => ({
      ordersUnreadCount,
      chatsUnreadCount,
      supportUnreadCount,
      supportUnreadPreview,
      syncOrdersUnread,
      syncChatsUnread,
      refreshOrdersUnread,
      refreshChatsUnread,
      refreshSupportUnread,
      isOrderUnviewed,
      onOrderViewed,
      onChatsInvalidate,
      onActiveChatMessage,
      setActiveChat,
      setActiveSupportChat,
      isActiveChat,
      markOrderViewed,
      markChatRead,
      markSupportRead,
    }),
    [
      ordersUnreadCount,
      chatsUnreadCount,
      supportUnreadCount,
      supportUnreadPreview,
      syncOrdersUnread,
      syncChatsUnread,
      refreshOrdersUnread,
      refreshChatsUnread,
      refreshSupportUnread,
      isOrderUnviewed,
      onOrderViewed,
      onChatsInvalidate,
      onActiveChatMessage,
      setActiveChat,
      setActiveSupportChat,
      isActiveChat,
      markOrderViewed,
      markChatRead,
      markSupportRead,
    ]
  )

  return (
    <StoreUnreadContext.Provider value={value}>{children}</StoreUnreadContext.Provider>
  )
}

export function useStoreUnread(): StoreUnreadContextValue {
  const ctx = useContext(StoreUnreadContext)
  if (!ctx) {
    throw new Error('useStoreUnread must be used within StoreUnreadProvider')
  }
  return ctx
}
