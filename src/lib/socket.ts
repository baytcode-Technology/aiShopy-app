import { io, type Socket } from 'socket.io-client'

import { env } from '@src/config/env'



let socket: Socket | null = null



export const SOCKET_EVENTS = {

  JOIN_STORE: 'store:join',

  MESSAGE_NEW: 'whatsapp:message:new',

  MESSAGE_STATUS: 'whatsapp:message:status',

  CONVERSATION_UPDATED: 'whatsapp:conversation:updated',

  INSTAGRAM_MESSAGE_NEW: 'instagram:message:new',

  INSTAGRAM_CONVERSATION_UPDATED: 'instagram:conversation:updated',

  ORDER_NEW: 'order:new',

} as const



export type SocketMessagePayload = {

  storeId: number

  conversationId: number

  message: {

    id: number

    meta_message_id: string

    direction: string

    type: string

    text_body: string | null

    status: string

    timestamp: string | null

    from_number: string

    to_number: string

  }

}



export type SocketStatusPayload = {

  storeId: number

  conversationId: number

  metaMessageId: string

  status: string

}



export type SocketConversationPayload = {

  storeId: number

  conversation: {

    id: number

    customer_wa_number: string

    last_message_at: string | null

    last_message_preview: string | null

    unread_count: number

  }

}



export type SocketInstagramMessagePayload = {

  storeId: number

  conversationId: number

  message: {

    id: number

    meta_message_id: string

    direction: string

    type: string

    text_body: string | null

    status: string

    timestamp: string | null

    from_ig_id: string

    to_ig_id: string

  }

}



export type SocketInstagramConversationPayload = {

  storeId: number

  conversation: {

    id: number

    customer_ig_id: string

    customer_ig_username: string | null

    last_message_at: string | null

    last_message_preview: string | null

    unread_count: number

  }

}



export type SocketOrderNewPayload = {

  storeId: number

  order: {

    id: number

    total: number

    currency: string

    source: string

    store_slug: string

    item_quantity?: number

  }

}



export function getChatSocket(): Socket | null {

  return socket

}



export function connectChatSocket(token: string): Socket {

  socket?.disconnect()

  socket = io(env.apiBaseUrl.replace(/\/$/, ''), {

    transports: ['websocket', 'polling'],

    auth: { token },

    autoConnect: true,

    reconnection: true,

    reconnectionAttempts: 10,

  })



  return socket

}



export function reconnectChatSocket(token: string): Socket {

  return connectChatSocket(token)

}



export function disconnectChatSocket(): void {

  socket?.disconnect()

  socket = null

}



export function joinStoreRoom(storeId: number): void {

  if (!socket?.connected) return

  socket.emit(SOCKET_EVENTS.JOIN_STORE, { storeId })

}

