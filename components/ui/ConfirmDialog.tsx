import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { useInModalPortal } from '@/components/ui/Modal'
import { Heading, Muted } from './Typography'

type Props = {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'danger' | 'primary'
  tone?: 'default' | 'danger'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmCard({
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <View className="flex-1 justify-center px-6">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={loading ? undefined : onCancel}
        accessibilityLabel="Dismiss"
      >
        <View className="flex-1 bg-ink-overlay" />
      </Pressable>

      <View className="bg-surface rounded-3xl border border-gray-200 p-6">
        <Heading className="text-xl mb-2 text-ink">{title}</Heading>
        <Muted className="text-[15px] leading-[22px] mb-6">{message}</Muted>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label={cancelLabel ?? 'Cancel'}
              variant="outline"
              onPress={onCancel}
              disabled={loading}
            />
          </View>
          <View className="flex-1">
            <Button
              label={confirmLabel ?? 'Confirm'}
              variant="primary"
              loading={loading}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export function ConfirmDialog(props: Props) {
  const inSheet = useInModalPortal(props.visible, <ConfirmCard {...props} />)
  if (inSheet) return null

  return (
    <RNModal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.loading ? undefined : props.onCancel}
    >
      <ConfirmCard {...props} />
    </RNModal>
  )
}
