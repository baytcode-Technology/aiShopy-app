import { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { cn } from '@src/lib/cn'
import { Heading, Subtitle } from './Typography'
import type { ScrollView as RNScrollView } from 'react-native'
import type { RefObject } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  scrollClassName?: string
  /**
   * Optional ref to the internal ScrollView so forms can auto-scroll to
   * validation errors.
   */
  scrollViewRef?: RefObject<RNScrollView>
}

export function SleekModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  scrollClassName,
  scrollViewRef,
}: Props) {
  return (
    <RNModal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close modal"
        >
          <View className="flex-1 bg-ink-overlay" />
        </Pressable>
        <KeyboardAvoidingView
          className="max-h-[92%]"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="bg-surface rounded-t-[32px] border border-gray-200 border-b-0 max-h-full overflow-hidden">
            <View className="self-center w-10 h-1 rounded-full bg-gray-200 mt-3" />
            <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <View className="flex-1 pr-4">
                <Heading className="text-[22px]">{title}</Heading>
                {subtitle ? <Subtitle className="mt-1 text-sm text-gray-500">{subtitle}</Subtitle> : null}
              </View>
              <Pressable onPress={onClose} hitSlop={12}>
                <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-base font-bold text-ink">✕</Text>
                </View>
              </Pressable>
            </View>
            <ScrollView
              ref={scrollViewRef as any}
              className={cn('max-h-[560px]', scrollClassName)}
              contentContainerClassName="px-6 py-5 gap-5"
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
            {footer ? (
              <View className="px-6 pt-3 pb-7 border-t border-gray-100 bg-gray-50">{footer}</View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  )
}
