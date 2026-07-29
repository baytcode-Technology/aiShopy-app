import { useMemo } from 'react'
import { View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { WebView } from 'react-native-webview'
import { Button } from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { Label } from '@/components/ui/Typography'
import { env } from '@src/config/env'
import type { ThemeTemplate } from '@src/types/store'

const DEFAULT_PRIMARY = '#2DB84C'

function buildPreviewUrl(template: string, primary: string, mode: string): string {
  const base = env.storefrontPreviewBaseUrl.replace(/\/$/, '')
  const params = new URLSearchParams()
  params.set('template', template)
  params.set('primary', primary)
  params.set('mode', mode)
  return `${base}/preview/storefront?${params.toString()}`
}

export default function TemplatePreviewScreen() {
  const params = useLocalSearchParams<{
    template?: string
    primary?: string
    mode?: string
  }>()

  const template = (params.template as ThemeTemplate) || 'classic'
  const primary =
    typeof params.primary === 'string' && /^#[0-9A-Fa-f]{6}$/.test(params.primary)
      ? params.primary
      : DEFAULT_PRIMARY
  const mode = params.mode === 'dark' ? 'dark' : 'light'

  const previewUrl = useMemo(
    () => buildPreviewUrl(template, primary, mode),
    [template, primary, mode],
  )

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Demo preview"
        subtitle="Sample products — orders are not placed"
        onBack={() => router.back()}
        showSettings={false}
      />
      <View className="flex-1 border-t border-gray-200">
        <WebView
          source={{ uri: previewUrl }}
          startInLoadingState
          allowsBackForwardNavigationGestures
          sharedCookiesEnabled={false}
        />
      </View>
      <View className="border-t border-gray-200 bg-surface px-4 py-3 gap-2">
        <Label className="text-center text-gray-500">
          Browsing {template} template with your selected colors
        </Label>
        <Button label="Close preview" variant="outline" onPress={() => router.back()} />
      </View>
    </Screen>
  )
}
