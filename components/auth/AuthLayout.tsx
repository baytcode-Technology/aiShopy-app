import { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn'
import { DisplayBrand, Heading, Subtitle } from '@/components/ui/Typography'

type Props = {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 py-8 justify-center"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AnimatedFadeIn>
            <View className="bg-surface rounded-[32px] border border-gray-200 p-7 shadow-sm">
              <DisplayBrand className="mb-8">Katlogue</DisplayBrand>
              <Heading className="text-[30px] mb-2 tracking-tight">{title}</Heading>
              <Subtitle className="text-[15px] leading-[22px] text-gray-500 mb-7">
                {subtitle}
              </Subtitle>

              <View className="gap-5 w-full">{children}</View>

              {footer ? (
                <View className="mt-7 pt-6 border-t border-gray-100 items-center w-full">
                  {footer}
                </View>
              ) : null}
            </View>
          </AnimatedFadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
