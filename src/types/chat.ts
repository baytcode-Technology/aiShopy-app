export type ChatListItem = {
  id: string
  title: string
  subtitle: string
  time: string
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

