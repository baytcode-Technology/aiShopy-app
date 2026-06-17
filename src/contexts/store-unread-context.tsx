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
import { useChatSocket } from '@src/contexts/chat-socket-context'
import { useStore } from '@src/contexts/store-context'
import { addNotificationReceivedListener } from '@src/lib/push-notifications'
import { showError } from '@src/lib/toast'
import type { ChatChannel, ChatListItem } from '@src/types/chat'
import type { Order } from '@src/types/order'

const CHAT_REFRESH_DEBOUNCE_MS = 300
const MARK_CHAT_READ_DEBOUNCE_MS = 500

type ActiveChat = { conversationId: string; channel: ChatChannel }

type StoreUnreadContextValue = {
  ordersUnreadCount: number
  chatsUnreadCount: number
  syncOrdersUnread: (orders: Order[]) => void
  syncChatsUnread: (items: ChatListItem[]) => void
  refreshOrdersUnread: () => Promise<void>
  refreshChatsUnread: () => Promise<void>
  isOrderUnviewed: (order: Order) => boolean
  onOrderViewed: (handler: (orderId: string) => void) => () => void
  onChatsInvalidate: (handler: () => void) => () => void
  onActiveChatMessage: (handler: (conversationId: string) => void) => () => void
  setActiveChat: (chat: ActiveChat | null) => void
  isActiveChat: (conversationId: string) => boolean
  markOrderViewed: (orderId: string) => Promise<void>
  markChatRead: (conversationId: string, channel: ChatChannel) => Promise<void>
}

const StoreUnreadContext = createContext<StoreUnreadContextValue | null>(null)

function countUnviewedOrders(orders: Order[], viewedOrderIds: Set<string>): number {
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
  const [viewedOrderIds, setViewedOrderIds] = useState<Set<string>>(() => new Set())
  const orderViewedListeners = useRef(new Set<(orderId: string) => void>())
  const chatsInvalidateListeners = useRef(new Set<() => void>())
  const activeChatMessageListeners = useRef(new Set<(conversationId: string) => void>())
  const markingOrderIds = useRef(new Set<string>())
  const chatRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markChatReadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeChatRef = useRef<ActiveChat | null>(null)

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
    setChatsUnreadCount(
      items.filter((c) => c.unread > 0 && c.id !== activeId).length
    )
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
      const count = [...whatsapp, ...instagram].filter(
        (c) => (c.unread_count ?? 0) > 0 && c.id !== activeId
      ).length
      setChatsUnreadCount(count)
    } catch {
      // Keep last known count.
    }
  }, [store?.id])

  const setActiveChat = useCallback((chat: ActiveChat | null) => {
    activeChatRef.current = chat
  }, [])

  const isActiveChat = useCallback((conversationId: string) => {
    return activeChatRef.current?.conversationId === conversationId
  }, [])

  const invalidateChats = useCallback(() => {
    chatsInvalidateListeners.current.forEach((handler) => handler())
  }, [])

  const notifyActiveChatMessage = useCallback((conversationId: string) => {
    activeChatMessageListeners.current.forEach((handler) => handler(conversationId))
  }, [])

  const markChatRead = useCallback(
    async (conversationId: string, channel: ChatChannel) => {
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
    (conversationId: string, channel: ChatChannel) => {
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
    (conversationId?: string) => {
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

  const onOrderViewed = useCallback((handler: (orderId: string) => void) => {
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

  const onActiveChatMessage = useCallback((handler: (conversationId: string) => void) => {
    activeChatMessageListeners.current.add(handler)
    return () => {
      activeChatMessageListeners.current.delete(handler)
    }
  }, [])

  useEffect(() => {
    if (!store?.id) {
      setOrdersUnreadCount(0)
      setChatsUnreadCount(0)
      setViewedOrderIds(new Set())
      activeChatRef.current = null
      return
    }
    void refreshOrdersUnread()
    void refreshChatsUnread()
  }, [store?.id, refreshOrdersUnread, refreshChatsUnread])

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
      if (data.type === 'chat') {
        const conversationId =
          typeof data.conversationId === 'string' ? data.conversationId : undefined
        scheduleChatsRefresh(conversationId)
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
    async (orderId: string) => {
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
      syncOrdersUnread,
      syncChatsUnread,
      refreshOrdersUnread,
      refreshChatsUnread,
      isOrderUnviewed,
      onOrderViewed,
      onChatsInvalidate,
      onActiveChatMessage,
      setActiveChat,
      isActiveChat,
      markOrderViewed,
      markChatRead,
    }),
    [
      ordersUnreadCount,
      chatsUnreadCount,
      syncOrdersUnread,
      syncChatsUnread,
      refreshOrdersUnread,
      refreshChatsUnread,
      isOrderUnviewed,
      onOrderViewed,
      onChatsInvalidate,
      onActiveChatMessage,
      setActiveChat,
      isActiveChat,
      markOrderViewed,
      markChatRead,
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
