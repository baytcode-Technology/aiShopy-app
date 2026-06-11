import axios from 'axios'
import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import { env } from '@src/config/env'
import { getAccessToken } from '@src/lib/auth-storage'
import type { ChatChannel } from '@src/types/chat'

export type ApiConversation = {
  id: string
  store_id: string
  customer_wa_number: string
  last_message_at: string | null
  last_message_preview: string | null
  unread_count?: number
}

export type ApiInstagramConversation = {
  id: string
  store_id: string
  customer_ig_id: string
  customer_ig_username: string | null
  last_message_at: string | null
  last_message_preview: string | null
  unread_count?: number
}

export type ListChatsResponse = {
  success: boolean
  message: string
  data: { store_id: string; chats: ApiConversation[]; count: number }
}

export type ApiMessage = {
  id: string
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
    store_id: string
    conversation_id: string
    messages: ApiMessage[]
    nextCursor: string | null
  }
}

export type SendMessageResponse = {
  success: boolean
  message: string
  data: {
    store_id: string
    conversation_id: string
    message: ApiMessage
    meta_message_id: string
  }
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')
  return apiFetch<T>(path, { ...init, token })
}

export async function fetchChats(storeId: string): Promise<ListChatsResponse> {
  const qs = new URLSearchParams({ store_id: storeId }).toString()
  return authFetch<ListChatsResponse>(`${endpoints.whatsappChats}?${qs}`)
}

export type ListInstagramChatsResponse = {
  success: boolean
  message: string
  data: { store_id: string; chats: ApiInstagramConversation[]; count: number }
}

export async function fetchInstagramChats(storeId: string): Promise<ListInstagramChatsResponse> {
  const qs = new URLSearchParams({ store_id: storeId }).toString()
  return authFetch<ListInstagramChatsResponse>(`${endpoints.instagramChats}?${qs}`)
}

export async function fetchAllChats(storeId: string): Promise<{
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
  id: string
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
    store_id: string
    conversation_id: string
    messages: ApiInstagramMessage[]
    nextCursor: string | null
  }
}

export async function fetchInstagramMessages(input: {
  storeId: string
  conversationId: string
  limit?: number
  cursor?: string | null
}): Promise<ListInstagramMessagesResponse> {
  const qs = new URLSearchParams({
    store_id: input.storeId,
    limit: String(input.limit ?? 30),
    ...(input.cursor ? { cursor: input.cursor } : {}),
  }).toString()

  return authFetch<ListInstagramMessagesResponse>(
    `${endpoints.instagramChats}/${input.conversationId}/messages?${qs}`
  )
}

export async function fetchChatMessages(input: {
  storeId: string
  conversationId: string
  limit?: number
  cursor?: string | null
}): Promise<ListMessagesResponse> {
  const qs = new URLSearchParams({
    store_id: input.storeId,
    limit: String(input.limit ?? 30),
    ...(input.cursor ? { cursor: input.cursor } : {}),
  }).toString()

  return authFetch<ListMessagesResponse>(
    `${endpoints.whatsappChats}/${input.conversationId}/messages?${qs}`
  )
}

export async function sendInstagramMessage(input: {
  storeId: string
  to: string
  message: string
  conversationId?: string
}): Promise<SendMessageResponse> {
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')

  const base = env.apiBaseUrl.replace(/\/$/, '')
  try {
    const { data } = await axios.post<SendMessageResponse>(
      `${base}${endpoints.instagramSend}`,
      {
        storeId: input.storeId,
        to: input.to,
        message: input.message,
        conversationId: input.conversationId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 20_000,
      }
    )
    return data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message =
        (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message ??
        err.message
      throw new Error(message || 'Failed to send message')
    }
    throw err
  }
}

export async function sendChatMessage(input: {
  storeId: string
  to: string
  message: string
  conversationId?: string
  channel?: ChatChannel
}): Promise<SendMessageResponse> {
  if (input.channel === 'instagram') {
    return sendInstagramMessage(input)
  }
  const token = await getAccessToken()
  if (!token) throw new Error('You are not signed in')

  const base = env.apiBaseUrl.replace(/\/$/, '')
  try {
    const { data } = await axios.post<SendMessageResponse>(
      `${base}${endpoints.whatsappSend}`,
      {
        storeId: input.storeId,
        to: input.to,
        message: input.message,
        conversationId: input.conversationId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 20_000,
      }
    )
    return data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message =
        (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message ??
        err.message
      throw new Error(message || 'Failed to send message')
    }
    throw err
  }
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
  id: string
  meta_message_id?: string
  direction: string
  type: string
  text_body: string | null
  status: string
  timestamp: string | null
}
