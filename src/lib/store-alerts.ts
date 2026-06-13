import { AppState } from 'react-native'
import Toast from 'react-native-toast-message'
import { presentLocalNotification } from '@src/lib/push-notifications'

function showAlertToast(title: string, body: string): void {
  Toast.show({
    type: 'alert',
    text1: title,
    text2: body,
    position: 'top',
    visibilityTime: 4500,
    topOffset: 56,
  })
}

function isViewingConversation(pathname: string, conversationId: string): boolean {
  return pathname.includes(`/chats/${conversationId}`)
}

export { isViewingConversation }

/** App open: toast. Background: system notification (phone default sound). Killed app: server push (needs FCM). */
export async function showStoreAlert(input: {
  title: string
  body: string
  data?: Record<string, string>
}): Promise<void> {
  if (AppState.currentState === 'active') {
    showAlertToast(input.title, input.body)
    return
  }

  await presentLocalNotification(input)
}
