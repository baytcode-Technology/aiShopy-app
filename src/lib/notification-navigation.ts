import { router, type Href } from 'expo-router'

export function navigateFromNotificationData(data: Record<string, unknown>): boolean {
  const type = typeof data.type === 'string' ? data.type : ''

  if (type === 'chat') {
    const conversationId =
      typeof data.conversationId === 'string' ? data.conversationId : null
    const channel = typeof data.channel === 'string' ? data.channel : 'whatsapp'

    if (!conversationId) {
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
    const orderId = typeof data.orderId === 'string' ? data.orderId : null

    if (!orderId) {
      router.navigate('/(store)/orders' as Href)
      return true
    }

    router.navigate('/(store)/orders' as Href)
    router.push(`/(store)/orders/${orderId}` as Href)
    return true
  }

  return false
}
