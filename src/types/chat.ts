export type ChatChannel = 'whatsapp' | 'instagram'

export type ChatListItem = {
  id: string
  channel: ChatChannel
  title: string
  subtitle: string
  time: string
  sortAt: string | null
  unread: number
  online: boolean
  phone: string
  initials: string
}

export type ChatMessage = {
  id: string
  metaMessageId?: string
  text: string
  time: string
  outgoing: boolean
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'received'
  pending?: boolean
}

