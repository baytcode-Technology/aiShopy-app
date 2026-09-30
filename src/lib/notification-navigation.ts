import { router, type Href } from 'expo-router'

function parseEntityId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function parseUserId(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
}

export function navigateFromNotificationData(data: Record<string, unknown>): boolean {
  const type = typeof data.type === 'string' ? data.type : ''
  const channel = typeof data.channel === 'string' ? data.channel : ''

  if (type === 'ticket_raised' || type === 'support_message') {
    const conversationId = parseEntityId(data.conversationId)
    if (conversationId != null) {
      router.navigate('/platform-admin-workspace/support' as Href)
      router.push(`/platform-support/${conversationId}` as Href)
      return true
    }
    router.navigate('/platform-admin-workspace/support' as Href)
    return true
  }

  if (type === 'user_signed_up') {
    const userId = parseUserId(data.userId)
    router.navigate('/platform-admin-workspace/users' as Href)
    if (userId) {
      router.push({
        pathname: '/platform-admin-user/[id]',
        params: { id: userId },
      } as Href)
    }
    return true
  }

  if (type === 'support' || channel === 'support') {
    router.navigate('/(store)/chats' as Href)
    router.push('/(store)/chats/support-ai' as Href)
    return true
  }

  if (type === 'chat') {
    const conversationId = parseEntityId(data.conversationId)
    const chatChannel = channel || 'whatsapp'

    if (conversationId == null) {
      router.navigate('/(store)/chats' as Href)
      return true
    }

    router.navigate('/(store)/chats' as Href)
    router.push({
      pathname: `/(store)/chats/${conversationId}`,
      params: { channel: chatChannel },
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
