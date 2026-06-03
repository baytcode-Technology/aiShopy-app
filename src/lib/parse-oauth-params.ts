import * as Linking from 'expo-linking'
import { Platform } from 'react-native'

export type OAuthCallbackParams = {
  code: string | null
  state: string | null
  idToken: string | null
  error: string | null
  errorDescription: string | null
}

function one(value: string | string[] | undefined | null): string | null {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0]
  }
  return null
}

/** Query string after a full-page Google redirect on web. */
export function getWebOAuthSearchParams(): Record<string, string | string[]> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return {}
  }
  const out: Record<string, string> = {}
  new URLSearchParams(window.location.search).forEach((value, key) => {
    out[key] = value
  })
  return out
}

export function parseOAuthCallbackParams(
  routeParams: Record<string, string | string[] | undefined>,
  incomingUrl: string | null
): OAuthCallbackParams {
  let code = one(routeParams.code)
  let state = one(routeParams.state)
  let idToken = one(routeParams.id_token)
  let error = one(routeParams.error)
  let errorDescription = one(routeParams.error_description)

  if (incomingUrl) {
    const parsed = Linking.parse(incomingUrl)
    const qp = parsed.queryParams ?? {}

    code = code ?? one(qp.code as string | string[] | undefined)
    state = state ?? one(qp.state as string | string[] | undefined)
    idToken =
      idToken ??
      one(qp.id_token as string | string[] | undefined) ??
      one(qp.idToken as string | string[] | undefined)
    error = error ?? one(qp.error as string | string[] | undefined)
    errorDescription =
      errorDescription ??
      one(qp.error_description as string | string[] | undefined)

    if (!code && !idToken && incomingUrl.includes('#')) {
      const hash = incomingUrl.split('#')[1]
      const hashParams = new URLSearchParams(hash)
      code = code ?? hashParams.get('code')
      state = state ?? hashParams.get('state')
      idToken = idToken ?? hashParams.get('id_token')
    }
  }

  return { code, state, idToken, error, errorDescription }
}
