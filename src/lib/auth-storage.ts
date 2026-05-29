import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'aishopy_access_token'
const REFRESH_TOKEN_KEY = 'aishopy_refresh_token'

/** SecureStore is native-only; use localStorage on web. */
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

export async function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY)
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY)
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await setItem(ACCESS_TOKEN_KEY, accessToken)
  await setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export async function clearTokens(): Promise<void> {
  await removeItem(ACCESS_TOKEN_KEY)
  await removeItem(REFRESH_TOKEN_KEY)
}
