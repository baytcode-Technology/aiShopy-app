import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { palette } from '@src/theme/palette'

type Props = {
  onCancel: () => void
  onSave: () => void
  saving?: boolean
  cancelLabel?: string
  saveLabel?: string
}

export function CancelSaveRow({
  onCancel,
  onSave,
  saving = false,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
}: Props) {
  return (
    <View className="flex-row gap-3 mt-4">
      <Pressable
        onPress={onCancel}
        disabled={saving}
        className="flex-1 py-3 rounded-xl border border-gray-200 bg-surface items-center justify-center"
        style={saving ? { opacity: 0.6 } : undefined}
      >
        <Text className="text-[14px] font-bold text-ink">{cancelLabel}</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={saving}
        className="flex-1 py-3 rounded-xl items-center justify-center"
        style={{ backgroundColor: palette.brandGreen, opacity: saving ? 0.7 : 1 }}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="text-[14px] font-bold text-white">{saveLabel}</Text>
        )}
      </Pressable>
    </View>
  )
}
