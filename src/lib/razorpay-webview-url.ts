import * as IntentLauncher from 'expo-intent-launcher'
import { Linking, Platform } from 'react-native'

export const EXTERNAL_PAYMENT_SCHEMES = new Set([
  'upi',
  'tez',
  'phonepe',
  'paytmmp',
  'gpay',
  'bhim',
  'credpay',
  'intent',
])

const WEBVIEW_ALLOWED_SCHEMES = new Set(['http', 'https', 'about', 'data', 'blob', 'javascript'])

function getScheme(url: string): string | null {
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(url.trim())
  return match?.[1]?.toLowerCase() ?? null
}

export function shouldOpenExternally(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false

  const scheme = getScheme(url)
  if (!scheme) return false
  if (WEBVIEW_ALLOWED_SCHEMES.has(scheme)) return false

  return !WEBVIEW_ALLOWED_SCHEMES.has(scheme)
}

async function openAndroidIntentUrl(url: string): Promise<void> {
  const intents = url.split('#Intent;')
  const path = intents[0] ?? ''
  const query = intents[1] ?? ''

  const params: Record<string, string> = {}
  for (const part of query.split(';')) {
    if (!part.includes('=')) continue
    const [key, value] = part.split('=')
    if (key && value) params[key.trim()] = value.trim()
  }

  const scheme = params.scheme
  const packageName = params.package
  const data = path.replace(/^intent:\/\//i, scheme ? `${scheme}://` : 'upi://')

  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data,
    ...(packageName ? { packageName } : {}),
  })
}

export async function openExternalPaymentUrl(url: string): Promise<void> {
  if (Platform.OS === 'android' && url.toLowerCase().startsWith('intent:')) {
    try {
      await openAndroidIntentUrl(url)
      return
    } catch {
      // Fall through to Linking below.
    }
  }

  const canOpen = await Linking.canOpenURL(url)
  if (!canOpen) {
    throw new Error('No payment app found to handle this request.')
  }

  await Linking.openURL(url)
}
