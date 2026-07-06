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
  fetchWhatsAppConnectionStatus,
  getWhatsAppConnectUrl,
  triggerWhatsAppSync,
  type WhatsAppConnectionStatus,
  type WhatsAppSyncJob,
} from '@src/api/whatsapp-connect'

type ScreenPhase = 'loading' | 'disconnected' | 'oauth' | 'polling' | 'connected' | 'error'

const POLL_INTERVAL_MS = 4000

function syncJobLabel(job: WhatsAppSyncJob): string {
  const type =
    job.sync_type === 'smb_app_state_sync' ? 'Contacts' : 'Chat history'
  const status =
    job.status === 'in_progress'
      ? 'Syncing…'
      : job.status === 'completed'
        ? 'Done'
        : job.status === 'declined'
          ? 'Skipped'
          : job.status === 'failed'
            ? 'Failed'
            : 'Pending'
  return `${type}: ${status}`
}

function SyncProgress({ status }: { status: WhatsAppConnectionStatus }) {
  if (!status.connected) return null

  if (status.sync_jobs.length === 0) {
    return (
      <Muted className="text-center text-[15px]">
        Waiting for sync to start…
      </Muted>
    )
  }

  return (
    <View className="gap-2 w-full">
      {status.sync_jobs.map((job) => (
        <Muted key={job.id} className="text-center text-[15px]">
          {syncJobLabel(job)}
        </Muted>
      ))}
    </View>
  )
}

export default function ConnectWhatsAppScreen() {
  const { store } = useStore()
  const [phase, setPhase] = useState<ScreenPhase>('loading')
  const [connection, setConnection] = useState<WhatsAppConnectionStatus | null>(null)
  const [retryingSync, setRetryingSync] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const refreshStatus = useCallback(async () => {
    if (!store?.id) return null
    const res = await fetchWhatsAppConnectionStatus(store.id)
    setConnection(res.data)
    return res.data
  }, [store?.id])

  const startPolling = useCallback(() => {
    stopPolling()
    setPhase('polling')

    void refreshStatus().then((status) => {
      if (status?.connected) {
        setPhase('connected')
        stopPolling()
      }
    })

    pollRef.current = setInterval(() => {
      void refreshStatus().then((status) => {
        if (status?.connected) {
          setPhase('connected')
          stopPolling()
        }
      })
    }, POLL_INTERVAL_MS)
  }, [refreshStatus, stopPolling])

  const startOAuth = useCallback(async () => {
    if (!store?.id) return
    setPhase('oauth')
    try {
      const res = await getWhatsAppConnectUrl(store.id)
      await WebBrowser.openBrowserAsync(res.data.url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      })
      startPolling()
    } catch (e: unknown) {
      setPhase('error')
      showError('Connect failed', e instanceof Error ? e.message : 'Unknown error')
    }
  }, [store?.id, startPolling])

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
          showError(
            'Could not load WhatsApp status',
            e instanceof Error ? e.message : 'Unknown error'
          )
        }
      }
    })()

    return () => {
      cancelled = true
      stopPolling()
    }
  }, [store?.id, refreshStatus, stopPolling])

  const handleRetrySync = async () => {
    if (!store?.id) return
    setRetryingSync(true)
    try {
      await triggerWhatsAppSync(store.id)
      showSuccess('Sync started', 'Contact and history sync triggered')
      startPolling()
    } catch (e: unknown) {
      showError('Sync failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setRetryingSync(false)
    }
  }

  const subtitle =
    phase === 'connected'
      ? connection?.whatsapp_number ?? 'Connected'
      : phase === 'disconnected'
        ? 'Not connected'
        : 'Link your WhatsApp Business account'

  return (
    <Screen>
      <ScreenHeader
        title="Connect WhatsApp"
        subtitle={subtitle}
        onBack={() => router.back()}
      />
      <ScreenScrollBody contentContainerClassName="pt-10 gap-6">
        <View className="items-center justify-center gap-4">
          {phase === 'loading' || phase === 'oauth' || phase === 'polling' ? (
            <ActivityIndicator color={Colors.brand.primary} size="large" />
          ) : null}

          {phase === 'connected' ? (
            <View className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 items-center justify-center">
              <FontAwesome name="whatsapp" size={28} color={Colors.brand.primary} />
            </View>
          ) : null}

          {phase === 'loading' ? (
            <Muted className="text-center text-[15px]">Checking connection…</Muted>
          ) : null}

          {phase === 'disconnected' ? (
            <>
              <Heading className="text-center text-xl">Not connected</Heading>
              <Muted className="text-center text-[15px] leading-6">
                Link your WhatsApp Business account to receive and reply to customer
                messages in Messages. Keep WhatsApp Business app installed (v2.24.17+).
              </Muted>
              <Button label="Connect WhatsApp" onPress={() => void startOAuth()} />
            </>
          ) : null}

          {phase === 'oauth' ? (
            <Muted className="text-center text-[15px]">Opening Meta connection…</Muted>
          ) : null}

          {phase === 'polling' ? (
            <>
              <Heading className="text-center text-xl">Finishing connection</Heading>
              <Muted className="text-center text-[15px] leading-6">
                Complete signup in the browser, then return here.{'\n'}
                Sync may take up to 24 hours after connect.
              </Muted>
              {connection ? <SyncProgress status={connection} /> : null}
              <Button
                label="Try connect again"
                variant="outline"
                onPress={() => void startOAuth()}
              />
            </>
          ) : null}

          {phase === 'connected' ? (
            <>
              <Heading className="text-center text-xl">WhatsApp connected</Heading>
              <Muted className="text-center text-[15px]">
                {connection?.is_on_biz_app
                  ? 'Phone + inbox coexistence is active.'
                  : 'Your number is linked. Coexistence sync will complete when Meta approves Tech Provider access.'}
              </Muted>
              {connection ? <SyncProgress status={connection} /> : null}
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

        {phase === 'connected' && connection?.connected ? (
          <Button
            label={retryingSync ? 'Retrying sync…' : 'Retry sync'}
            variant="outline"
            disabled={retryingSync}
            onPress={handleRetrySync}
          />
        ) : null}
      </ScreenScrollBody>
    </Screen>
  )
}
