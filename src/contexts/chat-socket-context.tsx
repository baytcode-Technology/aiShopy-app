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

  connectChatSocket,

  disconnectChatSocket,

  joinStoreRoom,

  SOCKET_EVENTS,

  type SocketConversationPayload,

  type SocketInstagramConversationPayload,

  type SocketInstagramMessagePayload,

  type SocketMessagePayload,

  type SocketStatusPayload,

} from '@src/lib/socket'

import { getAccessToken } from '@src/lib/auth-storage'

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



    void (async () => {

      if (!store?.id) {

        disconnectChatSocket()

        isConnectedRef.current = false

        return

      }



      const token = await getAccessToken()

      if (!token || cancelled) return



      const socket = connectChatSocket(token)



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



      if (socket.connected) handleConnect()

    })()



    return () => {

      cancelled = true

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


