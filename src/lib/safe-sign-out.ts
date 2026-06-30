import { router, type Href } from 'expo-router'
import { disconnectChatSocket } from '@src/lib/socket'
import { setSigningOut } from '@src/lib/session-manager'

export async function performSignOut(
  clearStore: () => Promise<void>,
  signOut: () => Promise<void>
): Promise<void> {
  setSigningOut(true)
  disconnectChatSocket()
  try {
    await clearStore()
    await signOut()
  } catch {
    // Ignore in-flight request failures while clearing session.
  }
  router.replace('/(auth)/login' as Href)
}
