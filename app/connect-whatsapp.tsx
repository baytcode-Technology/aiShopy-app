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
const POLL_MAX_ATTEMPTS = 4

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
  const oauthRunRef = useRef(0)

  const refreshStatus = useCallback(async () => {
    if (!store?.id) return null
    const res = await fetchWhatsAppConnectionStatus(store.id)
    setConnection(res.data)
    return res.data
  }, [store?.id])

  const waitForConnection = useCallback(async (runId: number): Promise<boolean> => {
    setPhase('polling')

    for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
      if (oauthRunRef.current !== runId) return false

      const status = await refreshStatus()
      if (status?.connected) {
        setPhase('connected')
        return true
      }
      if (attempt < POLL_MAX_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
      }
    }

    if (oauthRunRef.current !== runId) return false
    setPhase('disconnected')
    return false
  }, [refreshStatus])

  const startOAuth = useCallback(async () => {
    if (!store?.id) return
    const runId = ++oauthRunRef.current
    setPhase('oauth')
    try {
      const res = await getWhatsAppConnectUrl(store.id)
      const result = await WebBrowser.openBrowserAsync(res.data.url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      })

      if (oauthRunRef.current !== runId) return

      const status = await refreshStatus()
      if (status?.connected) {
        setPhase('connected')
        return
      }

      if (result.type === 'cancel') {
        setPhase('disconnected')
        return
      }

      const connected = await waitForConnection(runId)
      if (!connected && oauthRunRef.current === runId) {
        showError(
          'Connection not completed',
          'Finish signup in Meta or tap Connect WhatsApp to try again.'
        )
      }
    } catch (e: unknown) {
      if (oauthRunRef.current !== runId) return
      setPhase('error')
      showError('Connect failed', e instanceof Error ? e.message : 'Unknown error')
    }
  }, [store?.id, refreshStatus, waitForConnection])

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
      oauthRunRef.current += 1
    }
  }, [store?.id, refreshStatus])

  const handleRetrySync = async () => {
    if (!store?.id) return
    setRetryingSync(true)
    try {
      await triggerWhatsAppSync(store.id)
      showSuccess('Sync started', 'Contact and history sync triggered')
      await refreshStatus()
      setPhase('connected')
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
