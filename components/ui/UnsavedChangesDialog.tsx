import {
  ActivityIndicator,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Heading, Muted } from './Typography'

type Props = {
  visible: boolean
  loading?: boolean
  title?: string
  message?: string
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

export function UnsavedChangesDialog({
  visible,
  loading = false,
  title = 'Save changes?',
  message = 'You have unsaved changes on this page. Save before leaving?',
  onSave,
  onDiscard,
  onCancel,
}: Props) {
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
          accessibilityLabel="Keep editing"
        >
          <View className="flex-1 bg-ink-overlay" />
        </Pressable>

        <View className="bg-surface rounded-3xl border border-gray-200 p-5 shadow-sm">
          <Heading className="text-lg mb-1.5">{title}</Heading>
          <Muted className="text-[14px] leading-5 mb-5">{message}</Muted>

          <View className="flex-row gap-2.5">
            <Pressable
              onPress={onDiscard}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-gray-200 bg-surface items-center justify-center"
              style={loading ? { opacity: 0.5 } : undefined}
            >
              <Text className="text-[14px] font-bold text-ink">Don&apos;t save</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={loading}
              className="flex-1 py-3 rounded-xl items-center justify-center bg-brand-green"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-[14px] font-bold text-white">Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </RNModal>
  )
}
