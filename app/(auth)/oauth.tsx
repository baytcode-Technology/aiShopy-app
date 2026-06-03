import { useCallback, useEffect, useRef } from 'react'
import { Redirect, router, useGlobalSearchParams } from 'expo-router'
import { ActivityIndicator, Alert, Platform, Text, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import * as Linking from 'expo-linking'
import { AppLogo } from '@/components/brand/AppLogo'
import { useAuth } from '@src/contexts/auth-context'
import { env } from '@src/config/env'
import {
  shouldCompleteGoogleOAuth,
  validateGoogleOAuthSession,
} from '@src/lib/complete-google-oauth'
import {
  getGoogleAuthClientIds,
  getGoogleProviderRedirectUri,
} from '@src/lib/google-oauth-config'
import {
  clearGoogleOAuthPending,
  loadGoogleOAuthPending,
  persistGoogleOAuthPending,
} from '@src/lib/google-oauth-pending'
import { parseOAuthCallbackParams } from '@src/lib/parse-oauth-params'
import Colors from '@src/theme/colors'

WebBrowser.maybeCompleteAuthSession()

export default function GoogleOAuthScreen() {
  if (Platform.OS !== 'web') {
    return <Redirect href="/(auth)/login" />
  }

  return <GoogleOAuthWebFlow />
}

function GoogleOAuthWebFlow() {
  const routeParams = useGlobalSearchParams<{ start?: string }>()
  const incomingUrl = Linking.useURL()
  const { signInWithGoogle, signInWithGoogleAuthCode, setGoogleAuthInProgress } =
    useAuth()
  const finishedRef = useRef(false)
  const browserStartedRef = useRef(false)

  const finishError = useCallback(
    (message: string) => {
      finishedRef.current = true
      setGoogleAuthInProgress(false)
      void clearGoogleOAuthPending()
      Alert.alert('Google sign-in', message)
      router.replace('/(auth)/login')
    },
    [setGoogleAuthInProgress]
  )

  const finishSuccess = useCallback(() => {
    finishedRef.current = true
    setGoogleAuthInProgress(false)
    void clearGoogleOAuthPending()
    router.replace('/store-check')
  }, [setGoogleAuthInProgress])

  const redirectUri = getGoogleProviderRedirectUri()
  const config = {
    ...getGoogleAuthClientIds(env.google),
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
  }

  const [request, , promptAsync] = Google.useAuthRequest(config)

  useEffect(() => {
    setGoogleAuthInProgress(true)
    return () => {
      if (!finishedRef.current) {
        setGoogleAuthInProgress(false)
      }
    }
  }, [setGoogleAuthInProgress])

  useEffect(() => {
    if (!request?.url || finishedRef.current) {
      return
    }

    const parsed = parseOAuthCallbackParams(routeParams, incomingUrl)
    const startParam =
      routeParams.start === '1' || routeParams.start?.[0] === '1' ? '1' : undefined

    const completeOAuth = async (
      params: ReturnType<typeof parseOAuthCallbackParams>
    ) => {
      if (params.error) {
        finishError(params.errorDescription ?? params.error)
        return
      }

      try {
        if (params.idToken) {
          await signInWithGoogle(params.idToken)
          finishSuccess()
          return
        }

        const session = await loadGoogleOAuthPending()
        const { code, session: oauthSession } = validateGoogleOAuthSession(
          params,
          session
        )

        await signInWithGoogleAuthCode({
          code,
          redirectUri: oauthSession.redirectUri,
          codeVerifier: oauthSession.codeVerifier,
        })
        finishSuccess()
      } catch (e) {
        finishError(e instanceof Error ? e.message : 'Google sign-in failed')
      }
    }

    if (shouldCompleteGoogleOAuth(parsed)) {
      void completeOAuth(parsed)
      return
    }

    if (startParam !== '1') {
      if (!shouldCompleteGoogleOAuth(parsed)) {
        finishedRef.current = true
        setGoogleAuthInProgress(false)
        router.replace('/(auth)/login')
      }
      return
    }

    if (browserStartedRef.current) {
      return
    }
    browserStartedRef.current = true

    void (async () => {
      try {
        await persistGoogleOAuthPending({
          codeVerifier: request.codeVerifier ?? '',
          state: request.state ?? '',
          redirectUri,
          clientId: env.google.webClientId,
        })

        const result = await promptAsync({ showInRecents: true })
        if (result.type === 'cancel' || result.type === 'dismiss') {
          finishError('Google sign-in was cancelled')
          return
        }
        if (result.type === 'error') {
          finishError(result.error?.message ?? 'Google sign-in failed')
          return
        }
        if (result.type === 'success') {
          const merged = parseOAuthCallbackParams(
            (result.params ?? {}) as Record<string, string | string[] | undefined>,
            null
          )
          await completeOAuth(merged)
        }
      } catch (e) {
        finishError(e instanceof Error ? e.message : 'Could not start Google sign-in')
      }
    })()
  }, [
    incomingUrl,
    promptAsync,
    redirectUri,
    request,
    routeParams,
    signInWithGoogle,
    signInWithGoogleAuthCode,
    finishError,
    finishSuccess,
  ])

  return (
    <View className="flex-1 items-center justify-center bg-surface gap-4 px-8">
      <AppLogo variant="wordmark" align="center" />
      <ActivityIndicator size="large" color={Colors.brand.primary} />
      <Text className="text-sm text-gray-600 text-center">Redirecting to Google…</Text>
    </View>
  )
}
