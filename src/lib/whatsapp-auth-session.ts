import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import {
  parseOAuthCallbackUrl,
  WHATSAPP_APP_AUTH_REDIRECT_URI,
} from '@src/lib/whatsapp-embedded-signup'

WebBrowser.maybeCompleteAuthSession()

export type WhatsAppAuthSessionResult = {
  code: string
  state: string | null
}

export type WhatsAppAuthSessionError =
  | { type: 'cancelled' }
  | { type: 'dismissed' }
  | { type: 'error'; message: string }

function captureFromRedirectUrl(
  url: string,
  redirectUri: string
): WhatsAppAuthSessionResult | null {
  if (!url.startsWith(redirectUri)) return null

  const parsed = parseOAuthCallbackUrl(url)
  if (parsed.error || !parsed.code) return null

  let state: string | null = null
  try {
    state = new URL(url).searchParams.get('state')
  } catch {
    state = null
  }

  return { code: parsed.code, state }
}

const DISMISS_RACE_MS = 400

export async function openWhatsAppEmbeddedSignupAuthSession(input: {
  signupUrl: string
  redirectUri?: string
}): Promise<WhatsAppAuthSessionResult | WhatsAppAuthSessionError> {
  const redirectUri = input.redirectUri ?? WHATSAPP_APP_AUTH_REDIRECT_URI
  let pendingCapture: WhatsAppAuthSessionResult | null = null

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

    const result = await WebBrowser.openAuthSessionAsync(input.signupUrl, redirectUri, {
      preferEphemeralSession: false,
      showInRecents: true,
    })

    if (pendingCapture) return pendingCapture

    if (result.type === 'cancel') {
      return { type: 'cancelled' }
    }

    if (result.type === 'success' && result.url) {
      if (!result.url.startsWith(redirectUri)) {
        return { type: 'error', message: 'Unexpected redirect URL from Meta' }
      }

      const parsed = parseOAuthCallbackUrl(result.url)
      if (parsed.error) {
        return { type: 'error', message: parsed.error }
      }

      if (!parsed.code) {
        return { type: 'error', message: 'No authorization code in Meta redirect' }
      }

      let state: string | null = null
      try {
        state = new URL(result.url).searchParams.get('state')
      } catch {
        state = null
      }

      return { code: parsed.code, state }
    }

    if (result.type === 'dismiss') {
      await new Promise((resolve) => setTimeout(resolve, DISMISS_RACE_MS))
      if (pendingCapture) return pendingCapture
      return { type: 'dismissed' }
    }

    return { type: 'error', message: 'WhatsApp authorization did not complete' }
  } finally {
    linkingSubscription.remove()
    try {
      await WebBrowser.coolDownAsync()
    } catch {
      // optional
    }
  }
}
