import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { StoreSession } from '@src/types/store'

const STORE_SESSION_KEY = 'aishopy_store_session'

const isWeb = Platform.OS === 'web'

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    } catch {
      return null
    }
  }

  const available = await SecureStore.isAvailableAsync()
  if (!available) {
    return null
  }

  return SecureStore.getItemAsync(key)
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value)
    }
    return
  }

  await SecureStore.setItemAsync(key, value)
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
    return
  }

  await SecureStore.deleteItemAsync(key)
}

export async function getStoreSession(): Promise<StoreSession | null> {
  const raw = await getItem(STORE_SESSION_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as StoreSession
  } catch {
    return null
  }
}

export function normalizeStoreSession(
  session: StoreSession | null
): StoreSession | null {
  if (!session) return null
  return {
    ...session,
    role: session.role ?? 'owner',
  }
}

export async function saveStoreSession(session: StoreSession): Promise<void> {
  await setItem(STORE_SESSION_KEY, JSON.stringify(session))
}

export async function clearStoreSession(): Promise<void> {
  await removeItem(STORE_SESSION_KEY)
}
