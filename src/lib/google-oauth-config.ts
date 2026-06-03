import { makeRedirectUri } from 'expo-auth-session'
import { Platform } from 'react-native'

/** Web OAuth client IDs for expo-auth-session (web platform only). */
export type GoogleAuthClientIdsInput = {
  webClientId: string
  iosClientId?: string
  androidClientId?: string
}

export function isGoogleSignInConfigured(webClientId: string): boolean {
  return Boolean(webClientId.trim())
}

/** Redirect URI for web Google OAuth (google-callback route). */
export function getGoogleProviderRedirectUri(): string {
  const override = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI?.trim()
  if (override) {
    return override
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/google-callback`
  }
  return makeRedirectUri({ path: 'google-callback', preferLocalhost: true })
}

export function getGoogleAuthClientIds(input: GoogleAuthClientIdsInput | string) {
  const web =
    typeof input === 'string' ? input.trim() : input.webClientId.trim()
  return {
    webClientId: web,
    iosClientId: web,
    androidClientId: web,
  }
}

export function getGoogleOAuthSetupHint(): string {
  const lines = [
    'Web: add your site origin + /google-callback to Google Cloud → Web OAuth client redirect URIs.',
    getGoogleProviderRedirectUri(),
    '',
    'iOS/Android: use a development or production build with native Google Sign-In (not Expo Go).',
  ]
  return lines.join('\n')
}

