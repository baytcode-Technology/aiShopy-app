import type { AuthSessionResult } from 'expo-auth-session'
import { exchangeCodeAsync } from 'expo-auth-session'
import { discovery } from 'expo-auth-session/providers/google'
import type { AuthRequest } from 'expo-auth-session'

export async function completeGoogleAuthResult(
  result: AuthSessionResult,
  request: AuthRequest,
  redirectUri: string,
  clientId: string
): Promise<string> {
  if (result.type !== 'success') {
    throw new Error('Google sign-in did not complete')
  }

  const directToken =
    result.authentication?.idToken ??
    (typeof result.params?.id_token === 'string' ? result.params.id_token : null)

  if (directToken) {
    return directToken
  }

  const code = result.params?.code
  if (!code || typeof code !== 'string') {
    throw new Error('Google did not return an authorization code or ID token')
  }

  const authentication = await exchangeCodeAsync(
    {
      clientId,
      code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier ?? '',
      },
    },
    discovery
  )

  if (!authentication.idToken) {
    throw new Error('Google token exchange did not return an ID token')
  }

  return authentication.idToken
}
