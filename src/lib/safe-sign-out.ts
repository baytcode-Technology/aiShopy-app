import { router, type Href } from 'expo-router'
import { disconnectChatSocket } from '@src/lib/socket'
import { setSigningOut } from '@src/lib/session-manager'
import { unregisterDevicePushToken } from '@src/lib/unregister-push-token'

export async function performSignOut(
  clearStore: () => Promise<void>,
  signOut: () => Promise<void>
): Promise<void> {
  disconnectChatSocket()
  try {
    // Unregister while access token + store session are still available.
    await unregisterDevicePushToken()
    setSigningOut(true)
    await clearStore()
    await signOut()
  } catch {
    // Ignore in-flight request failures while clearing session.
  } finally {
    setSigningOut(false)
  }
  router.replace('/(auth)/login' as Href)
}
