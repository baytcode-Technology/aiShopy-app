import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { router } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Button } from '@/components/ui/Button'
import { Screen, ScreenScrollBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Heading, Muted } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import { useStore } from '@src/contexts/store-context'
import { showError, showSuccess } from '@src/lib/toast'
import {
  fetchInstagramConnectionStatus,
  getInstagramConnectUrl,
  subscribeInstagramWebhooks,
  type InstagramConnectionStatus,
} from '@src/api/instagram-connect'
import { openInstagramAuthSession } from '@src/lib/instagram-auth-session'

WebBrowser.maybeCompleteAuthSession()

type ScreenPhase = 'loading' | 'disconnected' | 'oauth' | 'connected' | 'error'

function formatInstagramHandle(username: string | null | undefined): string | null {
  if (!username?.trim()) return null
  return username.startsWith('@') ? username : `@${username}`
}

export default function InstagramConnectScreen() {
  const { store } = useStore()
  const [phase, setPhase] = useState<ScreenPhase>('loading')
  const [connection, setConnection] = useState<InstagramConnectionStatus | null>(null)
  const [subscribing, setSubscribing] = useState(false)
  const oauthRunRef = useRef(0)

  const refreshStatus = useCallback(async () => {
    if (!store?.id) return null
    const res = await fetchInstagramConnectionStatus(store.id)
    setConnection(res.data)
    return res.data
  }, [store?.id])

  const startOAuth = useCallback(async () => {
    if (!store?.id) return
    const runId = ++oauthRunRef.current
    setPhase('oauth')
    try {
      const res = await getInstagramConnectUrl(store.id)
      const authResult = await openInstagramAuthSession({ connectUrl: res.data.url })

      if (oauthRunRef.current !== runId) return

      if ('type' in authResult) {
        if (authResult.type === 'cancelled') {
          setPhase('disconnected')
          return
        }

        if (authResult.type === 'dismissed') {
          setPhase('disconnected')
          showError(
            'Connection not finished',
            'Instagram did not return to the app. Tap Connect Instagram to try again.'
          )
          return
        }

        setPhase('disconnected')
        showError('Connect failed', authResult.message)
        return
      }

      const status = await refreshStatus()
      setPhase('connected')

      const handle =
        formatInstagramHandle(authResult.username) ??
        formatInstagramHandle(status?.ig_username) ??
        'Your account'
      showSuccess('Instagram connected', handle)
    } catch (e: unknown) {
      if (oauthRunRef.current !== runId) return
      setPhase('error')
      showError(e, 'Connect failed')
    }
  }, [store?.id, refreshStatus])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!store?.id) return
      try {
        const status = await refreshStatus()
        if (cancelled) return
        if (status?.connected) {
          setPhase('connected')
        } else {
          setPhase('disconnected')
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setPhase('error')
          showError(e, 'Could not load Instagram status')
        }
      }
    })()

    return () => {
      cancelled = true
      oauthRunRef.current += 1
    }
  }, [store?.id, refreshStatus])

  const subtitle =
    phase === 'connected'
      ? connection?.ig_username
        ? `@${connection.ig_username}`
        : 'Connected'
      : phase === 'disconnected'
        ? 'Not connected'
        : 'Link your Instagram business account'

  return (
    <Screen>
      <ScreenHeader
        title="Connect Instagram"
        subtitle={subtitle}
        onBack={() => router.back()}
      />
      <ScreenScrollBody contentContainerClassName="pt-10 gap-6">
        <View className="items-center justify-center gap-4">
          {phase === 'loading' || phase === 'oauth' ? (
            <ActivityIndicator color={Colors.brand.primary} size="large" />
          ) : null}

          {phase === 'connected' ? (
            <View className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center">
              <FontAwesome name="instagram" size={28} color={Colors.brand.primary} />
            </View>
          ) : null}

          {phase === 'loading' ? (
            <Muted className="text-center text-[15px]">Checking connection…</Muted>
          ) : null}

          {phase === 'disconnected' ? (
            <>
              <Heading className="text-center text-xl">Not connected</Heading>
              <Muted className="text-center text-[15px] leading-6">
                Link your Instagram business account to receive customer DMs in Messages.
              </Muted>
              <Button label="Connect Instagram" onPress={() => void startOAuth()} />
            </>
          ) : null}

          {phase === 'oauth' ? (
            <Muted className="text-center text-[15px]">Connecting to Instagram…</Muted>
          ) : null}

          {phase === 'connected' ? (
            <>
              <Heading className="text-center text-xl">Instagram connected</Heading>
              <Muted className="text-center text-[15px]">
                {connection?.ig_username
                  ? `Your business account @${connection.ig_username} is linked.`
                  : 'Your Instagram business account is linked.'}
              </Muted>
              <Muted className="text-center text-[15px] leading-6">
                Customer DMs appear in Messages after they message you — not messages you send out.
              </Muted>
              <Button
                label={subscribing ? 'Enabling DMs…' : 'Enable DM notifications'}
                variant="outline"
                disabled={subscribing}
                onPress={async () => {
                  if (!store?.id) return
                  setSubscribing(true)
                  try {
                    await subscribeInstagramWebhooks(store.id)
                    const handle = formatInstagramHandle(connection?.ig_username)
                    showSuccess(
                      'DMs enabled',
                      handle
                        ? `Ask someone to DM ${handle}, then check Messages`
                        : 'Ask someone to DM your business account, then check Messages'
                    )
                  } catch (e: unknown) {
                    showError(e, 'Could not enable DMs')
                  } finally {
                    setSubscribing(false)
                  }
                }}
              />
              <Button label="Reconnect account" variant="outline" onPress={() => void startOAuth()} />
              <Button label="Done" onPress={() => router.back()} />
            </>
          ) : null}

          {phase === 'error' ? (
            <>
              <Muted className="text-center text-[15px]">
                Something went wrong. Check your network and try again.
              </Muted>
              <Button label="Retry" onPress={() => void startOAuth()} />
              <Button label="Go back" variant="outline" onPress={() => router.back()} />
            </>
          ) : null}
        </View>
      </ScreenScrollBody>
    </Screen>
  )
}
