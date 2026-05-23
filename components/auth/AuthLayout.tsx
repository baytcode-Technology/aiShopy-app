import { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native'
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
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow px-7 py-10 justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-9">
            <SectionTitle className="text-[13px] tracking-[4px] mb-7">Katlogue</SectionTitle>
            <Heading className="text-[32px] font-extrabold mb-2.5 tracking-[-0.8px]">
              {title}
            </Heading>
            <Subtitle className="text-sm leading-[21px] font-medium">{subtitle}</Subtitle>
          </View>

          <View className="gap-[18px]">{children}</View>

          {footer ? <View className="mt-9 items-center">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
