import { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Heading, SectionTitle, Subtitle } from '@/components/ui/Typography'

type Props = {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-7 pt-6 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-6">
            <SectionTitle className="text-[13px] tracking-[4px] mb-7 text-ink">
              Katlogue
            </SectionTitle>
            <Heading className="text-[32px] font-extrabold mb-2.5 tracking-[-0.8px] text-ink">
              {title}
            </Heading>
            <Subtitle className="text-sm leading-[21px] font-medium text-gray-600">
              {subtitle}
            </Subtitle>
          </View>

          <View className="gap-[18px] w-full">{children}</View>

          {footer ? <View className="mt-6 items-center w-full">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
