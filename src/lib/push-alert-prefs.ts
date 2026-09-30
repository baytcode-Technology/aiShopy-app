import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const STORE_ALERTS_KEY = 'aishopy_store_alerts_enabled'
const ADMIN_ALERTS_KEY = 'aishopy_admin_alerts_enabled'

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
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

async function readFlag(key: string, defaultValue: boolean): Promise<boolean> {
  const raw = await getItem(key)
  if (raw === '0') return false
  if (raw === '1') return true
  return defaultValue
}

export function getStoreAlertsEnabled(): Promise<boolean> {
  return readFlag(STORE_ALERTS_KEY, true)
}

export async function setStoreAlertsEnabledFlag(enabled: boolean): Promise<void> {
  await setItem(STORE_ALERTS_KEY, enabled ? '1' : '0')
}

export function getAdminAlertsEnabled(): Promise<boolean> {
  return readFlag(ADMIN_ALERTS_KEY, true)
}

export async function setAdminAlertsEnabledFlag(enabled: boolean): Promise<void> {
  await setItem(ADMIN_ALERTS_KEY, enabled ? '1' : '0')
}
