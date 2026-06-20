import { router, type Href } from 'expo-router'

function parseEntityId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function navigateFromNotificationData(data: Record<string, unknown>): boolean {
  const type = typeof data.type === 'string' ? data.type : ''

  if (type === 'chat') {
    const conversationId = parseEntityId(data.conversationId)
    const channel = typeof data.channel === 'string' ? data.channel : 'whatsapp'

    if (conversationId == null) {
      router.navigate('/(store)/chats' as Href)
      return true
    }

    router.navigate('/(store)/chats' as Href)
    router.push({
      pathname: `/(store)/chats/${conversationId}`,
      params: { channel },
    } as Href)
    return true
  }

  if (type === 'order') {
    const orderId = parseEntityId(data.orderId)

    if (orderId == null) {
      router.navigate('/(store)/orders' as Href)
      return true
    }

    router.navigate('/(store)/orders' as Href)
    router.push(`/(store)/orders/${orderId}` as Href)
    return true
  }

  return false
}
