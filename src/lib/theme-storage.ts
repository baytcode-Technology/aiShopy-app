import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { ThemeMode } from '@src/theme/palette'

const THEME_MODE_KEY = 'aishopy_theme_mode'

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
  if (!available) return null

  return SecureStore.getItemAsync(key)
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value)
      }
    } catch {
      // ignore
    }
    return
  }

  const available = await SecureStore.isAvailableAsync()
  if (!available) return

  await SecureStore.setItemAsync(key, value)
}

export async function getStoredThemeMode(): Promise<ThemeMode | null> {
  const raw = await getItem(THEME_MODE_KEY)
  if (raw === 'light' || raw === 'dark') return raw
  return null
}

export async function setStoredThemeMode(mode: ThemeMode): Promise<void> {
  await setItem(THEME_MODE_KEY, mode)
}
