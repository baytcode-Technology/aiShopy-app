import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, InteractionManager, Platform } from 'react-native'
import { router } from 'expo-router'
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { useAuth } from '@src/contexts/auth-context'
import { env, isGoogleSignInConfigured } from '@src/config/env'
import {
  clearNativeGoogleSignInSession,
  ensureNativeGoogleConfigured,
} from '@src/lib/google-native-session'

function afterNativeUiSettled(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

export function useNativeGoogleSignIn() {
  const { signInWithGoogle, setGoogleAuthInProgress } = useAuth()
  const signingInRef = useRef(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'web') {
      ensureNativeGoogleConfigured()
    }
  }, [])

  const signIn = useCallback(async () => {
    if (Platform.OS === 'web') {
      return
    }

    if (!isGoogleSignInConfigured()) {
      Alert.alert(
        'Google sign-in not configured',
        'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file.'
      )
      return
    }

    if (signingInRef.current) {
      return
    }

    ensureNativeGoogleConfigured()
    signingInRef.current = true
    setLoading(true)
    setGoogleAuthInProgress(true)

    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        })
      }

      // Show Google account picker (do not reuse last account silently).
      await clearNativeGoogleSignInSession()

      const result = await GoogleSignin.signIn()

      // Let the login screen remount cleanly after the native Google UI closes.
      setGoogleAuthInProgress(false)
      setLoading(false)
      signingInRef.current = false
      await afterNativeUiSettled()

      if (result.type === 'cancelled') {
        return
      }

      let idToken = result.data.idToken
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens()
        idToken = tokens.idToken
      }

      if (!idToken) {
        throw new Error('Google did not return an ID token')
      }

      await signInWithGoogle(idToken)
      await afterNativeUiSettled()
      router.replace('/store-check')
    } catch (e) {
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
        return
      }
      if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) {
        return
      }

      let message =
        e instanceof Error
          ? e.message || 'Google sign-in failed'
          : 'Google sign-in failed'
      if (
        isErrorWithCode(e) &&
        (e.code === '10' || message.includes('DEVELOPER_ERROR'))
      ) {
        message =
          'Google DEVELOPER_ERROR: SHA-1 in Google Cloud does not match this build.\n\n' +
          'Add your debug keystore SHA-1 to Google Cloud → Credentials → Android OAuth client (com.aishopy.app).\n' +
          'Get it: keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android\n' +
          'Wait ~10 minutes, then try again.'
      }
      await afterNativeUiSettled()
      Alert.alert('Google sign-in', message)
    } finally {
      signingInRef.current = false
      setLoading(false)
      setGoogleAuthInProgress(false)
    }
  }, [signInWithGoogle, setGoogleAuthInProgress])

  return { signIn, loading }
}
