import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const STORAGE_KEY = 'aishopy_google_oauth_pending'

export type GoogleOAuthPending = {
  codeVerifier: string
  state: string
  redirectUri: string
  clientId: string
}

let memoryPending: GoogleOAuthPending | null = null

function readWebPending(): GoogleOAuthPending | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as GoogleOAuthPending
  } catch {
    return null
  }
}

function writeWebPending(session: GoogleOAuthPending): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function clearWebPending(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

export async function persistGoogleOAuthPending(
  session: GoogleOAuthPending
): Promise<void> {
  memoryPending = session
  if (Platform.OS === 'web') {
    writeWebPending(session)
    return
  }
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session))
}

export async function loadGoogleOAuthPending(): Promise<GoogleOAuthPending | null> {
  if (memoryPending) {
    return memoryPending
  }

  if (Platform.OS === 'web') {
    const web = readWebPending()
    if (web) {
      memoryPending = web
    }
    return web
  }

  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as GoogleOAuthPending
    memoryPending = parsed
    return parsed
  } catch {
    return null
  }
}

export async function clearGoogleOAuthPending(): Promise<void> {
  memoryPending = null
  if (Platform.OS === 'web') {
    clearWebPending()
    return
  }
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY)
  } catch {
    // ignore
  }
}
