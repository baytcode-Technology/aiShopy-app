import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Screen, ScreenBody } from '@/components/ui/Screen'
import { ScreenHeader } from '@/components/ui/ScreenHeader'

type Props = {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  onBack?: () => void
}

export function PaymentMethodConfigLayout({ title, subtitle, children, footer, onBack }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Screen>
      <ScreenHeader title={title} subtitle={subtitle} onBack={onBack ?? (() => router.back())} />
      <ScreenBody className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-2 pb-6 gap-4 grow"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? (
          <View
            className="w-full px-5 pt-3 border-t border-gray-100 bg-surface"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="w-full max-w-full overflow-hidden">{footer}</View>
          </View>
        ) : null}
      </ScreenBody>
    </Screen>
  )
}
