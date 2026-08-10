import { ApiHttpError, authenticatedFetch, getValidAccessToken } from '@src/api/client'

import { endpoints } from '@src/api/endpoints'

import { env } from '@src/config/env'

import { buildWhatsAppMediaUrl } from '@src/lib/whatsapp-media'

import { enrichMessageFromRawPayload } from '@src/lib/prepare-whatsapp-messages'

import { prepareWhatsAppMediaUpload } from '@src/lib/prepare-whatsapp-media-upload'

import type { ChatChannel, ChatMessage } from '@src/types/chat'



export type ApiConversation = {

  id: number

  store_id: number

  customer_wa_number: string

  customer_name?: string | null

  last_message_at: string | null

  last_message_preview: string | null

  unread_count?: number

  reply_mode?: 'ai' | 'manual'

}



export type ApiInstagramConversation = {

  id: number

  store_id: number

  customer_ig_id: string

  customer_ig_username: string | null

  last_message_at: string | null

  last_message_preview: string | null

  unread_count?: number

  reply_mode?: 'ai' | 'manual'

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

  media_id?: string | null

  mime_type?: string | null

  caption?: string | null

  status?: string

  timestamp: string | null

  raw_payload?: unknown

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

export type UploadWhatsAppMediaResponse = {
  success: boolean
  message: string
  data: { store_id: number; media_id: string; mime_type: string }
}

export type SendMediaMessageResponse = {
  success: boolean
  message: string
  data: {
    store_id: number
    conversation_id: number
    message: ApiMessage
    meta_message_id: string
  }
}

export type ForwardMessageResponse = SendMediaMessageResponse

function parseUploadErrorBody(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null) {
    if ('error' in body) {
      const message = (body as { error?: { message?: string } }).error?.message
      if (message) return message
    }
    if ('message' in body && typeof (body as { message?: string }).message === 'string') {
      return (body as { message: string }).message
    }
  }
  return fallback
}

async function postWhatsAppMediaUpload(
  uploadUrl: string,
  prepared: { uri: string; name: string; type: string },
  input: { kind: 'image' | 'audio' | 'video'; voice?: boolean },
  token: string,
): Promise<UploadWhatsAppMediaResponse> {
  const formData = new FormData()
  formData.append('file', {
    uri: prepared.uri,
    name: prepared.name,
    type: prepared.type,
  } as unknown as Blob)
  formData.append('kind', input.kind)
  if (input.voice) {
    formData.append('voice', 'true')
  }

  let res: Response
  try {
    res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Network request failed while uploading media'
    throw new ApiHttpError(message, 0, null)
  }

  const text = await res.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!res.ok) {
    throw new ApiHttpError(
      parseUploadErrorBody(body, res.statusText || 'Upload failed'),
      res.status,
      body,
    )
  }

  return body as UploadWhatsAppMediaResponse
}

export async function uploadWhatsAppMedia(input: {
  storeId: number
  kind: 'image' | 'audio' | 'video'
  uri: string
  name: string
  type: string
  voice?: boolean
}): Promise<UploadWhatsAppMediaResponse> {
  let prepared
  try {
    prepared = await prepareWhatsAppMediaUpload({
      kind: input.kind,
      uri: input.uri,
      name: input.name,
      type: input.type,
    })
  } catch (e: unknown) {
    throw new ApiHttpError(
      e instanceof Error ? e.message : 'Media file is missing or empty',
      400,
      null,
    )
  }

  const qs = new URLSearchParams({
    store_id: String(input.storeId),
    kind: input.kind,
    ...(input.voice ? { voice: 'true' } : {}),
  }).toString()

  const base = env.apiBaseUrl.replace(/\/$/, '')
  const uploadUrl = `${base}${endpoints.whatsappMediaUpload}?${qs}`

  const token = await getValidAccessToken()
  return postWhatsAppMediaUpload(uploadUrl, prepared, input, token)
}

export async function sendWhatsAppMediaMessage(input: {
  storeId: number
  to: string
  conversationId?: number
  type: 'image' | 'audio' | 'video'
  mediaId: string
  mimeType?: string
  caption?: string
  voice?: boolean
}): Promise<SendMediaMessageResponse> {
  return authenticatedFetch<SendMediaMessageResponse>(endpoints.whatsappSendMedia, {
    method: 'POST',
    body: JSON.stringify({
      storeId: input.storeId,
      to: input.to,
      conversationId: input.conversationId,
      type: input.type,
      mediaId: input.mediaId,
      mimeType: input.mimeType,
      caption: input.caption,
      voice: input.voice,
    }),
  })
}

export async function forwardWhatsAppMessage(input: {
  storeId: number
  sourceMessageId: number
  targetConversationId: number
}): Promise<ForwardMessageResponse> {
  return authenticatedFetch<ForwardMessageResponse>(endpoints.whatsappForward, {
    method: 'POST',
    body: JSON.stringify({
      storeId: input.storeId,
      sourceMessageId: input.sourceMessageId,
      targetConversationId: input.targetConversationId,
    }),
  })
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



function mapMessageFields(
  m: {
    id: number
    meta_message_id?: string
    direction: string
    type: string
    text_body: string | null
    media_id?: string | null
    mime_type?: string | null
    caption?: string | null
    raw_payload?: unknown
    status?: string
    timestamp: string | null
  },
  storeId?: number
): ChatMessage {
  const time = m.timestamp
    ? new Date(m.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const enriched = enrichMessageFromRawPayload({
    type: m.type,
    textBody: m.text_body,
    mediaId: m.media_id,
    mimeType: m.mime_type,
    caption: m.caption,
    rawPayload: m.raw_payload,
  })

  const mediaId = enriched.mediaId
  const reactionEmoji =
    m.type === 'reaction'
      ? (enriched.reactionEmoji ??
          enriched.textBody.replace(/^Reacted\s+/u, '').trim()) ||
        undefined
      : undefined

  return {
    id: m.id,
    metaMessageId: m.meta_message_id,
    type: m.type,
    text: enriched.textBody,
    time,
    timestamp: m.timestamp ?? null,
    outgoing: m.direction === 'outbound',
    status: m.status as ChatMessage['status'],
    mediaId,
    mimeType: enriched.mimeType,
    caption: enriched.caption,
    mediaUrl:
      mediaId && storeId ? buildWhatsAppMediaUrl(mediaId, storeId) : undefined,
    reactionEmoji,
    reactionTargetId: enriched.reactionTargetId,
  }
}

export function mapApiMessageToChatMessage(m: ApiMessage, storeId: number) {
  return mapMessageFields(m, storeId)
}

export function mapSocketMessageToChatMessage(
  m: SendMessageResponse['data']['message'] | SocketMessageShape,
  storeId: number
) {
  return mapMessageFields(m, storeId)
}

export function messagePreviewText(m: { text_body: string | null; type: string }): string {
  return m.text_body?.trim() || `[${m.type}]`
}

type SocketMessageShape = {
  id: number
  meta_message_id?: string
  direction: string
  type: string
  text_body: string | null
  media_id?: string | null
  mime_type?: string | null
  caption?: string | null
  raw_payload?: unknown
  status: string
  timestamp: string | null
}

