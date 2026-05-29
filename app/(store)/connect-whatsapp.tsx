import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { router } from 'expo-router'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Muted } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import { useStore } from '@src/contexts/store-context'
import { showError } from '@src/lib/toast'
import { getWhatsAppConnectUrl } from '@src/api/whatsapp-connect'

export default function ConnectWhatsAppScreen() {
  const { store } = useStore()
  const [status, setStatus] = useState<'opening' | 'done'>('opening')

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        if (!store?.id) return
        const res = await getWhatsAppConnectUrl(store.id)
        if (cancelled) return

        await WebBrowser.openBrowserAsync(res.data.url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        })

        if (cancelled) return
        setStatus('done')
      } catch (e: unknown) {
        showError('Connect failed', e instanceof Error ? e.message : 'Unknown error')
        router.back()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [store?.id])

  return (
    <Screen>
      <ScreenHeader title="Connect WhatsApp" subtitle="Link your WhatsApp Business account" />
      <ScreenBody className="px-5 pt-10">
        <View className="items-center justify-center gap-4">
          <ActivityIndicator color={Colors.brand.primary} size="large" />
          <Muted className="text-center text-[15px]">
            {status === 'opening'
              ? 'Opening Meta connection…'
              : 'Connection flow closed. Return to your browser tab to finish if needed.'}
          </Muted>
        </View>
      </ScreenBody>
    </Screen>
  )
}

