import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { AuthSession, AuthUser } from '@src/types/auth'

const ACCESS_TOKEN_KEY = 'aishopy_access_token'
const REFRESH_TOKEN_KEY = 'aishopy_refresh_token'
const USER_KEY = 'aishopy_auth_user'
const SESSION_META_KEY = 'aishopy_session_meta'

export type StoredSessionMeta = {
  expiresAt: number
  expiresIn: number
}

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

export async function saveAuthUser(user: AuthUser): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user))
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const raw = await getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export async function saveSessionMeta(meta: StoredSessionMeta): Promise<void> {
  await setItem(SESSION_META_KEY, JSON.stringify(meta))
}

export async function getSessionMeta(): Promise<StoredSessionMeta | null> {
  const raw = await getItem(SESSION_META_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredSessionMeta
  } catch {
    return null
  }
}

export async function saveAuthSession(session: AuthSession, user: AuthUser): Promise<void> {
  await saveTokens(session.accessToken, session.refreshToken)
  await saveAuthUser(user)
  await saveSessionMeta({
    expiresAt: session.expiresAt,
    expiresIn: session.expiresIn,
  })
}

export async function clearTokens(): Promise<void> {
  await removeItem(ACCESS_TOKEN_KEY)
  await removeItem(REFRESH_TOKEN_KEY)
  await removeItem(USER_KEY)
  await removeItem(SESSION_META_KEY)
}
