import { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { cn } from '@src/lib/cn'
import { Heading, Subtitle } from './Typography'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  scrollClassName?: string
}

export function SleekModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  scrollClassName,
}: Props) {
  return (
    <RNModal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-ink/40" onPress={onClose} />
        <KeyboardAvoidingView
          className="max-h-[90%]"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="bg-surface rounded-t-[24px] border border-gray-200 border-b-0 max-h-full shadow-2xl">
            <View className="self-center w-9 h-1 rounded-full bg-gray-200 mt-3" />
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
              <View className="flex-1 pr-4">
                <Heading className="text-xl">{title}</Heading>
                {subtitle ? <Subtitle className="mt-1 text-sm">{subtitle}</Subtitle> : null}
              </View>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text className="text-lg font-bold text-ink">✕</Text>
              </Pressable>
            </View>
            <ScrollView
              className={cn('max-h-[560px]', scrollClassName)}
              contentContainerClassName="px-6 py-5 gap-4"
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
            {footer ? (
              <View className="px-6 pt-3 pb-6 border-t border-gray-100">{footer}</View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  )
}
