import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import {
  disconnectChatSocket,
  joinStoreRoom,
  reconnectChatSocket,
  SOCKET_EVENTS,
  type SocketConversationPayload,
  type SocketInstagramConversationPayload,
  type SocketInstagramMessagePayload,
  type SocketMessagePayload,
  type SocketStatusPayload,
} from '@src/lib/socket'
import { ensureValidSession, onTokensRefreshed } from '@src/lib/session-manager'
import { useStore } from '@src/contexts/store-context'

type ChatSocketContextValue = {
  isConnected: boolean
  onMessageNew: (handler: (payload: SocketMessagePayload) => void) => () => void
  onMessageStatus: (handler: (payload: SocketStatusPayload) => void) => () => void
  onConversationUpdated: (handler: (payload: SocketConversationPayload) => void) => () => void
  onInstagramMessageNew: (
    handler: (payload: SocketInstagramMessagePayload) => void
  ) => () => void
  onInstagramConversationUpdated: (
    handler: (payload: SocketInstagramConversationPayload) => void
  ) => () => void
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null)

export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { store } = useStore()
  const isConnectedRef = useRef(false)
  const messageHandlers = useRef(new Set<(payload: SocketMessagePayload) => void>())
  const statusHandlers = useRef(new Set<(payload: SocketStatusPayload) => void>())
  const conversationHandlers = useRef(new Set<(payload: SocketConversationPayload) => void>())
  const instagramMessageHandlers = useRef(
    new Set<(payload: SocketInstagramMessagePayload) => void>()
  )
  const instagramConversationHandlers = useRef(
    new Set<(payload: SocketInstagramConversationPayload) => void>()
  )

  useEffect(() => {
    let cancelled = false
    let detachSocketListeners: (() => void) | undefined

    const connectWithToken = async (token: string) => {
      if (cancelled || !store?.id) return

      detachSocketListeners?.()
      const socket = reconnectChatSocket(token)

      const handleConnect = () => {
        isConnectedRef.current = true
        joinStoreRoom(store.id)
      }

      const handleDisconnect = () => {
        isConnectedRef.current = false
      }

      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
      socket.on(SOCKET_EVENTS.MESSAGE_NEW, (payload: SocketMessagePayload) => {
        messageHandlers.current.forEach((handler) => handler(payload))
      })
      socket.on(SOCKET_EVENTS.MESSAGE_STATUS, (payload: SocketStatusPayload) => {
        statusHandlers.current.forEach((handler) => handler(payload))
      })
      socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, (payload: SocketConversationPayload) => {
        conversationHandlers.current.forEach((handler) => handler(payload))
      })
      socket.on(SOCKET_EVENTS.INSTAGRAM_MESSAGE_NEW, (payload: SocketInstagramMessagePayload) => {
        instagramMessageHandlers.current.forEach((handler) => handler(payload))
      })
      socket.on(
        SOCKET_EVENTS.INSTAGRAM_CONVERSATION_UPDATED,
        (payload: SocketInstagramConversationPayload) => {
          instagramConversationHandlers.current.forEach((handler) => handler(payload))
        }
      )

      detachSocketListeners = () => {
        socket.off('connect', handleConnect)
        socket.off('disconnect', handleDisconnect)
        socket.off(SOCKET_EVENTS.MESSAGE_NEW)
        socket.off(SOCKET_EVENTS.MESSAGE_STATUS)
        socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED)
        socket.off(SOCKET_EVENTS.INSTAGRAM_MESSAGE_NEW)
        socket.off(SOCKET_EVENTS.INSTAGRAM_CONVERSATION_UPDATED)
      }

      if (socket.connected) handleConnect()
    }

    if (!store?.id) {
      disconnectChatSocket()
      isConnectedRef.current = false
      return () => {
        cancelled = true
      }
    }

    void ensureValidSession()
      .then((token) => connectWithToken(token))
      .catch(() => {
        disconnectChatSocket()
        isConnectedRef.current = false
      })

    const unsubscribe = onTokensRefreshed((token) => {
      void connectWithToken(token)
    })

    return () => {
      cancelled = true
      unsubscribe()
      detachSocketListeners?.()
      disconnectChatSocket()
      isConnectedRef.current = false
    }
  }, [store?.id])

  const onMessageNew = useCallback((handler: (payload: SocketMessagePayload) => void) => {
    messageHandlers.current.add(handler)
    return () => {
      messageHandlers.current.delete(handler)
    }
  }, [])

  const onMessageStatus = useCallback((handler: (payload: SocketStatusPayload) => void) => {
    statusHandlers.current.add(handler)
    return () => {
      statusHandlers.current.delete(handler)
    }
  }, [])

  const onConversationUpdated = useCallback(
    (handler: (payload: SocketConversationPayload) => void) => {
      conversationHandlers.current.add(handler)
      return () => {
        conversationHandlers.current.delete(handler)
      }
    },
    []
  )

  const onInstagramMessageNew = useCallback(
    (handler: (payload: SocketInstagramMessagePayload) => void) => {
      instagramMessageHandlers.current.add(handler)
      return () => {
        instagramMessageHandlers.current.delete(handler)
      }
    },
    []
  )

  const onInstagramConversationUpdated = useCallback(
    (handler: (payload: SocketInstagramConversationPayload) => void) => {
      instagramConversationHandlers.current.add(handler)
      return () => {
        instagramConversationHandlers.current.delete(handler)
      }
    },
    []
  )

  const value = useMemo(
    () => ({
      isConnected: isConnectedRef.current,
      onMessageNew,
      onMessageStatus,
      onConversationUpdated,
      onInstagramMessageNew,
      onInstagramConversationUpdated,
    }),
    [
      onMessageNew,
      onMessageStatus,
      onConversationUpdated,
      onInstagramMessageNew,
      onInstagramConversationUpdated,
    ]
  )

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>
}

export function useChatSocket() {
  const ctx = useContext(ChatSocketContext)
  if (!ctx) {
    throw new Error('useChatSocket must be used within ChatSocketProvider')
  }
  return ctx
}
