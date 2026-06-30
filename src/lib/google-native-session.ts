import { Platform } from 'react-native'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { env, isGoogleSignInConfigured } from '@src/config/env'

let configured = false

export function ensureNativeGoogleConfigured(): void {
  if (Platform.OS === 'web' || configured || !isGoogleSignInConfigured()) {
    return
  }

  if (Platform.OS === 'ios' && !env.google.iosClientId) {
    throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is required for iOS Google Sign-In')
  }

  GoogleSignin.configure({
    webClientId: env.google.webClientId,
    iosClientId: Platform.OS === 'ios' ? env.google.iosClientId : undefined,
    offlineAccess: false,
    scopes: ['openid', 'profile', 'email'],
  })
  configured = true
}

/** Clears the Google SDK account cache so the next sign-in shows the account picker. */
export async function clearNativeGoogleSignInSession(): Promise<void> {
  if (Platform.OS === 'web') {
    return
  }
  ensureNativeGoogleConfigured()
  try {
    await GoogleSignin.signOut()
  } catch {
    // Not signed in with Google SDK yet — safe to ignore.
  }
}
