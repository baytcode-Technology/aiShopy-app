import { authenticatedFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'

export type InboxAiSettings = {
  ai_auto_reply_enabled: boolean
  ai_system_prompt: string | null
  ai_language: string | null
  ai_third_party_consented: boolean
  premium: boolean
}

export type InboxAiSettingsResponse = {
  success: boolean
  message: string
  data: InboxAiSettings
}

export async function fetchInboxAiSettings(storeId: number): Promise<InboxAiSettingsResponse> {
  return authenticatedFetch<InboxAiSettingsResponse>(
    endpoints.inboxAiSettings(storeId)
  )
}

export async function updateInboxAiSettings(
  storeId: number,
  payload: Partial<{
    ai_auto_reply_enabled: boolean
    ai_system_prompt: string | null
    ai_language: string | null
    ai_third_party_consent: true
  }>
): Promise<InboxAiSettingsResponse> {
  return authenticatedFetch<InboxAiSettingsResponse>(endpoints.inboxAiSettings(storeId), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function setChatReplyMode(input: {
  channel: 'whatsapp' | 'instagram'
  storeId: number
  conversationId: number
  replyMode: 'ai' | 'manual'
}): Promise<void> {
  const base =
    input.channel === 'whatsapp'
      ? endpoints.whatsappReplyMode(input.conversationId, input.storeId)
      : endpoints.instagramReplyMode(input.conversationId, input.storeId)

  await authenticatedFetch(base, {
    method: 'POST',
    body: JSON.stringify({ reply_mode: input.replyMode }),
  })
}

export type InboxAiPreviewResult = {
  intent: string
  customerLanguage: string
  scriptStyle: 'malayalam_script' | 'latin' | 'other'
  searchQuery: string | null
  color: string | null
  categoryName: string | null
  requestedItem: string | null
  replyText: string
  wouldSendImage: boolean
  hasFollowUpText: boolean
  lastShownProductTitle: string | null
  note: string
}

export type InboxAiPreviewResponse = {
  success: boolean
  message: string
  data: InboxAiPreviewResult
}

export async function previewInboxAiReply(
  storeId: number,
  input: { message: string; channel?: 'whatsapp' | 'instagram' }
): Promise<InboxAiPreviewResponse> {
  return authenticatedFetch<InboxAiPreviewResponse>(endpoints.inboxAiPreview(storeId), {
    method: 'POST',
    body: JSON.stringify({
      message: input.message.trim(),
      channel: input.channel ?? 'whatsapp',
    }),
  })
}
