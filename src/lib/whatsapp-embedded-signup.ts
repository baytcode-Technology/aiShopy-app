import { env } from '@src/config/env'

/** Deep link prefix openAuthSessionAsync listens for (must match backend oauth-callback redirect). */
export const WHATSAPP_APP_AUTH_REDIRECT_URI = 'aishopyapp://whatsapp-oauth'

export type EmbeddedSignupFinishEvent =
  | 'FINISH'
  | 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
  | 'FINISH_ONLY_WABA'
  | 'CANCEL'
  | 'ERROR'

export function buildOAuthCallbackPath(): string {
  return '/api/whatsapp/oauth/callback'
}

export function getOAuthCallbackUrlPrefix(): string {
  const base = env.apiBaseUrl.replace(/\/$/, '')
  return `${base}${buildOAuthCallbackPath()}`
}

export function isWhatsAppOAuthCallbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.pathname.endsWith(buildOAuthCallbackPath())
  } catch {
    return url.includes(buildOAuthCallbackPath())
  }
}

export function parseOAuthCallbackUrl(url: string): {
  code: string | null
  error: string | null
  hash: string | null
  hasCodeInQuery: boolean
  hasCodeInHash: boolean
} {
  try {
    const parsed = new URL(url)
    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''))
    const codeFromQuery = parsed.searchParams.get('code')
    const codeFromHash = hashParams.get('code')
    return {
      code: codeFromQuery ?? codeFromHash,
      error:
        parsed.searchParams.get('error') ??
        parsed.searchParams.get('error_reason') ??
        hashParams.get('error'),
      hash: parsed.hash || null,
      hasCodeInQuery: Boolean(codeFromQuery),
      hasCodeInHash: Boolean(codeFromHash),
    }
  } catch {
    return {
      code: null,
      error: null,
      hash: null,
      hasCodeInQuery: false,
      hasCodeInHash: false,
    }
  }
}

export function extractOAuthCodeFromUrl(url: string): string | null {
  const { code, error } = parseOAuthCallbackUrl(url)
  if (error) return null
  return code?.trim() || null
}
