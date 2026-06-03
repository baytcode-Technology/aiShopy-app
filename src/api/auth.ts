import { apiFetch } from '@src/api/client'
import { endpoints } from '@src/api/endpoints'
import type { ApiResponse, VerifyOtpData } from '@src/types/auth'

export async function sendSignInOtp(email: string): Promise<ApiResponse<{ email: string }>> {
  return apiFetch<ApiResponse<{ email: string }>>(endpoints.authSignIn, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  })
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<ApiResponse<VerifyOtpData>> {
  return apiFetch<ApiResponse<VerifyOtpData>>(endpoints.authVerify, {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    }),
  })
}

export async function signInWithGoogle(
  idToken: string
): Promise<ApiResponse<VerifyOtpData>> {
  return apiFetch<ApiResponse<VerifyOtpData>>(endpoints.authGoogle, {
    method: 'POST',
    body: JSON.stringify({ idToken: idToken.trim() }),
  })
}

export async function signInWithGoogleAuthCode(input: {
  code: string
  redirectUri: string
  codeVerifier: string
}): Promise<ApiResponse<VerifyOtpData>> {
  return apiFetch<ApiResponse<VerifyOtpData>>(endpoints.authGoogleCode, {
    method: 'POST',
    body: JSON.stringify({
      code: input.code.trim(),
      redirectUri: input.redirectUri.trim(),
      codeVerifier: input.codeVerifier.trim(),
    }),
  })
}
