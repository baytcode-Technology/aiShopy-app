import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native'
import { Heading, Muted } from './Typography'

type Props = {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmBg =
    confirmVariant === 'primary' ? '#3EB056' : '#EF4444'
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
    >
      <View className="flex-1 justify-center px-6">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={loading ? undefined : onCancel}
          accessibilityLabel="Dismiss"
        >
          <View className="flex-1 bg-ink-overlay" />
        </Pressable>

        <View className="bg-surface rounded-3xl border border-gray-200 p-6 shadow-sm">
          <Heading className="text-xl mb-2">{title}</Heading>
          <Muted className="text-[15px] leading-[22px] mb-6">{message}</Muted>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-200 bg-surface items-center justify-center"
              style={loading ? { opacity: 0.5 } : undefined}
            >
              <Text className="text-[16px] font-bold text-ink">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="flex-1 py-4 rounded-2xl items-center justify-center border-2"
              style={{
                backgroundColor: confirmBg,
                borderColor: confirmBg,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-[16px] font-bold text-white">{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </RNModal>
  )
}
