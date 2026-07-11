import { InteractionManager, Platform } from 'react-native'

/** Extra wait after native auth UI on iOS before hitting our API. */
const IOS_POST_NATIVE_AUTH_DELAY_MS = 800

/** Best-effort warmup — avoids broken URLSession state after Google/Apple native auth on some iOS versions. */
const IOS_NETWORK_WARMUP_URL = 'https://www.google.com/generate_204'

function afterInteractions(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

export function isTransientNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return true
  }
  if (error instanceof Error && /network request failed|network connection was lost/i.test(error.message)) {
    return true
  }
  return false
}

export async function settleAfterNativeAuthUi(): Promise<void> {
  await afterInteractions()
  if (Platform.OS !== 'ios') {
    return
  }

  await new Promise((resolve) => setTimeout(resolve, IOS_POST_NATIVE_AUTH_DELAY_MS))

  try {
    await fetch(IOS_NETWORK_WARMUP_URL, { method: 'GET', cache: 'no-store' })
  } catch {
    // Warmup is best-effort only.
  }

  await new Promise((resolve) => setTimeout(resolve, 200))
}

export async function withTransientNetworkRetry<T>(
  fn: () => Promise<T>,
  options?: { attempts?: number; delayMs?: number }
): Promise<T> {
  const attempts = options?.attempts ?? 3
  const delayMs = options?.delayMs ?? 600
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isTransientNetworkError(error) || attempt === attempts - 1) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      if (Platform.OS === 'ios') {
        await settleAfterNativeAuthUi()
      }
    }
  }

  throw lastError
}
