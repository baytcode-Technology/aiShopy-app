import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import {
  INSTAGRAM_APP_AUTH_REDIRECT_URI,
  parseInstagramOAuthRedirectUrl,
} from '@src/lib/instagram-oauth'

WebBrowser.maybeCompleteAuthSession()

export type InstagramAuthSessionResult = {
  connected: boolean
  username: string | null
}

export type InstagramAuthSessionError =
  | { type: 'cancelled' }
  | { type: 'dismissed' }
  | { type: 'error'; message: string }

function captureFromRedirectUrl(
  url: string,
  redirectUri: string
): InstagramAuthSessionResult | null {
  if (!url.startsWith(redirectUri)) return null

  const parsed = parseInstagramOAuthRedirectUrl(url)
  if (parsed.error) return null
  if (!parsed.connected) return null

  return {
    connected: true,
    username: parsed.username,
  }
}

const DISMISS_RACE_MS = 400

export async function openInstagramAuthSession(input: {
  connectUrl: string
  redirectUri?: string
}): Promise<InstagramAuthSessionResult | InstagramAuthSessionError> {
  const redirectUri = input.redirectUri ?? INSTAGRAM_APP_AUTH_REDIRECT_URI
  let pendingCapture: InstagramAuthSessionResult | null = null

  const linkingSubscription = Linking.addEventListener('url', (event) => {
    const captured = captureFromRedirectUrl(event.url, redirectUri)
    if (captured) pendingCapture = captured
  })

  try {
    try {
      await WebBrowser.warmUpAsync()
    } catch {
      // optional on some platforms
    }

    const result = await WebBrowser.openAuthSessionAsync(input.connectUrl, redirectUri, {
      preferEphemeralSession: false,
      showInRecents: true,
    })

    if (pendingCapture) return pendingCapture

    if (result.type === 'cancel') {
      return { type: 'cancelled' }
    }

    if (result.type === 'success' && result.url) {
      if (!result.url.startsWith(redirectUri)) {
        return { type: 'error', message: 'Unexpected redirect URL from Instagram' }
      }

      const parsed = parseInstagramOAuthRedirectUrl(result.url)
      if (parsed.error) {
        return { type: 'error', message: parsed.error }
      }

      if (!parsed.connected) {
        return { type: 'error', message: 'Instagram connection did not complete' }
      }

      return {
        connected: true,
        username: parsed.username,
      }
    }

    if (result.type === 'dismiss') {
      await new Promise((resolve) => setTimeout(resolve, DISMISS_RACE_MS))
      if (pendingCapture) return pendingCapture
      return { type: 'dismissed' }
    }

    return { type: 'error', message: 'Instagram authorization did not complete' }
  } finally {
    linkingSubscription.remove()
    try {
      await WebBrowser.coolDownAsync()
    } catch {
      // optional
    }
  }
}
