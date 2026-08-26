import { useCallback, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'
import { router } from 'expo-router'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useAuth } from '@src/contexts/auth-context'
import {
  deferNavigationAfterNativeAuth,
  isTransientNetworkError,
  settleAfterNativeAuthUi,
} from '@src/lib/ios-network-settle'

function hasNameParts(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null
): fullName is AppleAuthentication.AppleAuthenticationFullName {
  if (!fullName) return false
  return Boolean(fullName.givenName || fullName.middleName || fullName.familyName)
}

export function useNativeAppleSignIn() {
  const { signInWithApple, setGoogleAuthInProgress } = useAuth()
  const signingInRef = useRef(false)
  const [loading, setLoading] = useState(false)

  const signIn = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    if (signingInRef.current) {
      return
    }

    signingInRef.current = true
    setLoading(true)
    // Reuse the Google auth-in-progress guard so AppState resume does not wipe session mid-native sheet.
    setGoogleAuthInProgress(true)

    let navigatedAway = false
    try {
      const available = await AppleAuthentication.isAvailableAsync()
      if (!available) {
        Alert.alert(
          'Sign in with Apple',
          'Sign in with Apple is not available on this device. Use Google or email instead.'
        )
        return
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      await settleAfterNativeAuthUi()

      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token')
      }

      await signInWithApple({
        idToken: credential.identityToken,
        ...(hasNameParts(credential.fullName)
          ? {
              fullName: {
                givenName: credential.fullName.givenName ?? undefined,
                middleName: credential.fullName.middleName ?? undefined,
                familyName: credential.fullName.familyName ?? undefined,
              },
            }
          : {}),
      })

      await settleAfterNativeAuthUi()
      await deferNavigationAfterNativeAuth(() => {
        router.replace('/store-check')
      })
      navigatedAway = true
    } catch (e) {
      const code =
        e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : ''
      if (code === 'ERR_REQUEST_CANCELED' || code === 'ERR_CANCELED') {
        return
      }

      let message =
        e instanceof Error ? e.message || 'Apple sign-in failed' : 'Apple sign-in failed'
      if (isTransientNetworkError(e)) {
        message =
          'Could not reach the server after Apple sign-in. Check your connection and try again, or use email sign-in.'
      }
      await settleAfterNativeAuthUi()
      Alert.alert('Sign in with Apple', message)
    } finally {
      signingInRef.current = false
      if (navigatedAway) {
        setTimeout(() => {
          setLoading(false)
          setGoogleAuthInProgress(false)
        }, 800)
      } else {
        setLoading(false)
        setGoogleAuthInProgress(false)
      }
    }
  }, [signInWithApple, setGoogleAuthInProgress])

  return { signIn, loading }
}
