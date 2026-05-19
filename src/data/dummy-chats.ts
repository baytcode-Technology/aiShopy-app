export type ConversationFilter = 'all' | 'unread' | 'orders' | 'priority'

export type Conversation = {
  id: string
  name: string
  phone: string
  initials: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  priority?: boolean
  hasOrder?: boolean
}

export type ChatMessage = {
  id: string
  text: string
  time: string
  outgoing: boolean
}

export const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+91 98765 43210',
    initials: 'JS',
    lastMessage: 'Is the product still available?',
    time: '10:30 AM',
    unread: 2,
    online: true,
    priority: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+91 91234 56789',
    initials: 'SJ',
    lastMessage: 'Thank you for the quick delivery!',
    time: '9:45 AM',
    unread: 0,
    online: false,
    hasOrder: true,
  },
  {
    id: '3',
    name: 'Michael Chen',
    phone: '+91 99887 76655',
    initials: 'MC',
    lastMessage: 'Can I get a discount on bulk orders?',
    time: 'Yesterday',
    unread: 1,
    online: true,
  },
  {
    id: '4',
    name: 'Emily Davis',
    phone: '+91 97654 32109',
    initials: 'ED',
    lastMessage: 'When will my order be shipped?',
    time: 'Yesterday',
    unread: 0,
    online: false,
    hasOrder: true,
  },
  {
    id: '5',
    name: 'David Wilson',
    phone: '+91 90123 45678',
    initials: 'DW',
    lastMessage: 'I need help with my order #1234',
    time: 'Tuesday',
    unread: 3,
    online: true,
    priority: true,
    hasOrder: true,
  },
]

export const DUMMY_MESSAGES: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1', text: 'Hey, how are you?', time: '10:20 AM', outgoing: false },
    { id: 'm2', text: "I'm good! How about you?", time: '10:22 AM', outgoing: true },
    { id: 'm3', text: 'Is the product still available?', time: '10:30 AM', outgoing: false },
  ],
  '2': [
    { id: 'm1', text: 'My order arrived today.', time: '9:30 AM', outgoing: false },
    { id: 'm2', text: 'Glad to hear that! Thank you for shopping with us.', time: '9:40 AM', outgoing: true },
    { id: 'm3', text: 'Thank you for the quick delivery!', time: '9:45 AM', outgoing: false },
  ],
  '3': [
    { id: 'm1', text: 'Can I get a discount on bulk orders?', time: 'Yesterday', outgoing: false },
    { id: 'm2', text: 'Share the quantity you need and we will reply with a quote.', time: 'Yesterday', outgoing: true },
  ],
  '4': [
    { id: 'm1', text: 'When will my order be shipped?', time: 'Yesterday', outgoing: false },
  ],
  '5': [
    { id: 'm1', text: 'I need help with my order #1234', time: 'Tuesday', outgoing: false },
    { id: 'm2', text: 'We are checking your order status now.', time: 'Tuesday', outgoing: true },
  ],
}

export function getConversation(id: string): Conversation | undefined {
  return DUMMY_CONVERSATIONS.find((c) => c.id === id)
}

export function filterConversations(
  list: Conversation[],
  filter: ConversationFilter
): Conversation[] {
  switch (filter) {
    case 'unread':
      return list.filter((c) => c.unread > 0)
    case 'orders':
      return list.filter((c) => c.hasOrder)
    case 'priority':
      return list.filter((c) => c.priority)
    default:
      return list
  }
}
