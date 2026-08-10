import type { ChatMessage } from '@src/types/chat'

export type ChatDateSeparatorItem = {
  kind: 'date-separator'
  id: string
  label: string
}

export type ChatListItem = ChatMessage | ChatDateSeparatorItem

export function isDateSeparatorItem(item: ChatListItem): item is ChatDateSeparatorItem {
  return 'kind' in item && item.kind === 'date-separator'
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export function formatChatDateLabel(date: Date, now = new Date()): string {
  if (isSameCalendarDay(date, now)) return 'Today'

  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function dayKeyFromTimestamp(timestamp: string | null): string | null {
  if (!timestamp) return null
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return null
  return startOfDay(date).toISOString()
}

export function injectChatDateSeparators(messages: ChatMessage[]): ChatListItem[] {
  if (messages.length === 0) return []

  const result: ChatListItem[] = []
  const now = new Date()

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i]
    result.push(current)

    const currentDayKey = dayKeyFromTimestamp(current.timestamp)
    if (!currentDayKey) continue

    const next = messages[i + 1]
    const nextDayKey = next ? dayKeyFromTimestamp(next.timestamp) : null

    if (!next || currentDayKey !== nextDayKey) {
      const label = formatChatDateLabel(new Date(current.timestamp!), now)
      result.push({
        kind: 'date-separator',
        id: `date-sep-${currentDayKey}`,
        label,
      })
    }
  }

  return result
}
