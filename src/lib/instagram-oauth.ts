import * as Linking from 'expo-linking'

/** Must match backend `INSTAGRAM_APP_AUTH_REDIRECT_URI`. */
export const INSTAGRAM_APP_AUTH_REDIRECT_URI = 'aishopyapp://instagram-oauth'

export type InstagramOAuthRedirect = {
  connected: boolean
  username: string | null
  error: string | null
}

function readParam(value: string | string[] | undefined | null): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return null
}

export function parseInstagramOAuthRedirectUrl(url: string): InstagramOAuthRedirect {
  try {
    const parsed = Linking.parse(url)
    const qp = parsed.queryParams ?? {}
    const error = readParam(qp.error as string | string[] | undefined)
    const connected = readParam(qp.connected as string | string[] | undefined) === '1'
    const username = readParam(qp.username as string | string[] | undefined)

    return { connected, username, error }
  } catch {
    return { connected: false, username: null, error: 'invalid_redirect' }
  }
}
