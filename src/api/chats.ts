import { authenticatedFetch } from '@src/api/client'

import { endpoints } from '@src/api/endpoints'

import type { ChatChannel } from '@src/types/chat'



export type ApiConversation = {

  id: number

  store_id: number

  customer_wa_number: string

  last_message_at: string | null

  last_message_preview: string | null

  unread_count?: number

}



export type ApiInstagramConversation = {

  id: number

  store_id: number

  customer_ig_id: string

  customer_ig_username: string | null

  last_message_at: string | null

  last_message_preview: string | null

  unread_count?: number

}



export type ListChatsResponse = {

  success: boolean

  message: string

  data: { store_id: number; chats: ApiConversation[]; count: number }

}



export type ApiMessage = {

  id: number

  meta_message_id: string

  direction: string

  type: string

  text_body: string | null

  status?: string

  timestamp: string | null

}



export type ListMessagesResponse = {

  success: boolean

  message: string

  data: {

    store_id: number

    conversation_id: number

    messages: ApiMessage[]

    nextCursor: string | null

  }

}



export type SendMessageResponse = {

  success: boolean

  message: string

  data: {

    store_id: number

    conversation_id: number

    message: ApiMessage

    meta_message_id: string

  }

}



export async function fetchChats(storeId: number): Promise<ListChatsResponse> {

  const qs = new URLSearchParams({ store_id: String(storeId) }).toString()

  return authenticatedFetch<ListChatsResponse>(`${endpoints.whatsappChats}?${qs}`)

}



export type ListInstagramChatsResponse = {

  success: boolean

  message: string

  data: { store_id: number; chats: ApiInstagramConversation[]; count: number }

}



export async function fetchInstagramChats(storeId: number): Promise<ListInstagramChatsResponse> {

  const qs = new URLSearchParams({ store_id: String(storeId) }).toString()

  return authenticatedFetch<ListInstagramChatsResponse>(`${endpoints.instagramChats}?${qs}`)

}



export async function fetchAllChats(storeId: number): Promise<{

  whatsapp: ApiConversation[]

  instagram: ApiInstagramConversation[]

}> {

  const [waResult, igResult] = await Promise.allSettled([

    fetchChats(storeId).then((r) => r.data.chats),

    fetchInstagramChats(storeId).then((r) => r.data.chats),

  ])



  return {

    whatsapp: waResult.status === 'fulfilled' ? waResult.value : [],

    instagram: igResult.status === 'fulfilled' ? igResult.value : [],

  }

}



export type ApiInstagramMessage = {

  id: number

  meta_message_id: string

  direction: string

  type: string

  text_body: string | null

  status?: string

  timestamp: string | null

}



export type ListInstagramMessagesResponse = {

  success: boolean

  message: string

  data: {

    store_id: number

    conversation_id: number

    messages: ApiInstagramMessage[]

    nextCursor: string | null

  }

}



export async function fetchInstagramMessages(input: {

  storeId: number

  conversationId: number

  limit?: number

  cursor?: string | null

}): Promise<ListInstagramMessagesResponse> {

  const qs = new URLSearchParams({

    store_id: String(input.storeId),

    limit: String(input.limit ?? 30),

    ...(input.cursor ? { cursor: input.cursor } : {}),

  }).toString()



  return authenticatedFetch<ListInstagramMessagesResponse>(

    `${endpoints.instagramChats}/${input.conversationId}/messages?${qs}`

  )

}



export async function fetchChatMessages(input: {

  storeId: number

  conversationId: number

  limit?: number

  cursor?: string | null

}): Promise<ListMessagesResponse> {

  const qs = new URLSearchParams({

    store_id: String(input.storeId),

    limit: String(input.limit ?? 30),

    ...(input.cursor ? { cursor: input.cursor } : {}),

  }).toString()



  return authenticatedFetch<ListMessagesResponse>(

    `${endpoints.whatsappChats}/${input.conversationId}/messages?${qs}`

  )

}



export async function sendInstagramMessage(input: {

  storeId: number

  to: string

  message: string

  conversationId?: number

}): Promise<SendMessageResponse> {

  return authenticatedFetch<SendMessageResponse>(endpoints.instagramSend, {

    method: 'POST',

    body: JSON.stringify({

      storeId: input.storeId,

      to: input.to,

      message: input.message,

      conversationId: input.conversationId,

    }),

  })

}



export async function sendChatMessage(input: {

  storeId: number

  to: string

  message: string

  conversationId?: number

  channel?: ChatChannel

}): Promise<SendMessageResponse> {

  if (input.channel === 'instagram') {

    return sendInstagramMessage(input)

  }

  return authenticatedFetch<SendMessageResponse>(endpoints.whatsappSend, {

    method: 'POST',

    body: JSON.stringify({

      storeId: input.storeId,

      to: input.to,

      message: input.message,

      conversationId: input.conversationId,

    }),

  })

}



export async function markChatRead(input: {

  storeId: number

  conversationId: number

  channel: ChatChannel

}): Promise<{ success: boolean; message: string }> {

  const qs = new URLSearchParams({ store_id: String(input.storeId) }).toString()

  const base =

    input.channel === 'instagram' ? endpoints.instagramChats : endpoints.whatsappChats

  return authenticatedFetch(`${base}/${input.conversationId}/mark-read?${qs}`, {

    method: 'POST',

  })

}



export function mapApiMessageToChatMessage(m: ApiMessage) {

  const time = m.timestamp

    ? new Date(m.timestamp).toLocaleTimeString([], {

        hour: '2-digit',

        minute: '2-digit',

      })

    : ''



  return {

    id: m.id,

    metaMessageId: m.meta_message_id,

    text: m.text_body ?? `[${m.type}]`,

    time,

    outgoing: m.direction === 'outbound',

    status: m.status as

      | 'pending'

      | 'sent'

      | 'delivered'

      | 'read'

      | 'failed'

      | 'received'

      | undefined,

  }

}



export function mapSocketMessageToChatMessage(

  m: SendMessageResponse['data']['message'] | SocketMessageShape

) {

  const time = m.timestamp

    ? new Date(m.timestamp).toLocaleTimeString([], {

        hour: '2-digit',

        minute: '2-digit',

      })

    : ''



  return {

    id: m.id,

    metaMessageId: 'meta_message_id' in m ? m.meta_message_id : undefined,

    text: m.text_body ?? `[${m.type}]`,

    time,

    outgoing: m.direction === 'outbound',

    status: m.status as

      | 'pending'

      | 'sent'

      | 'delivered'

      | 'read'

      | 'failed'

      | 'received'

      | undefined,

  }

}



type SocketMessageShape = {

  id: number

  meta_message_id?: string

  direction: string

  type: string

  text_body: string | null

  status: string

  timestamp: string | null

}

