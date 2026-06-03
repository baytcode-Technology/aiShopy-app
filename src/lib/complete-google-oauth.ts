import { parseOAuthCallbackParams } from '@src/lib/parse-oauth-params'
import type { GoogleOAuthPending } from '@src/lib/google-oauth-pending'

export type GoogleOAuthParams = ReturnType<typeof parseOAuthCallbackParams>

export function shouldCompleteGoogleOAuth(parsed: GoogleOAuthParams): boolean {
  return Boolean(parsed.code || parsed.idToken || parsed.error)
}

export function validateGoogleOAuthSession(
  parsed: GoogleOAuthParams,
  session: GoogleOAuthPending | null
): { code: string; session: GoogleOAuthPending } {
  if (!parsed.code) {
    throw new Error('No Google authorization code received.')
  }
  if (!session) {
    throw new Error('Sign-in session expired. Please try again.')
  }
  if (session.state && parsed.state && session.state !== parsed.state) {
    throw new Error('Google sign-in state mismatch. Please try again.')
  }
  return { code: parsed.code, session }
}
