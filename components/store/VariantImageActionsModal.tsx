import type { ComponentProps } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  onClose: () => void
  onView: () => void
  onReplace: () => void
  onRemove: () => void
}

const REPLACE_GREEN = '#16A34A'
const REMOVE_RED = '#EF4444'

export function VariantImageActionsModal({
  visible,
  onClose,
  onView,
  onReplace,
  onRemove,
}: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/45 justify-end px-5" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full bg-white rounded-2xl px-5 py-4 shadow-lg"
          style={{ marginBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[17px] font-bold text-ink">Actions</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityLabel="Close"
              className="w-8 h-8 rounded-full items-center justify-center active:opacity-70"
            >
              <FontAwesome name="times" size={18} color={Colors.text.secondary} />
            </Pressable>
          </View>

          <ActionRow
            icon="eye"
            label="View media"
            onPress={() => {
              onClose()
              onView()
            }}
          />
          <ActionRow
            icon="refresh"
            label="Replace media"
            iconColor={REPLACE_GREEN}
            labelColor={REPLACE_GREEN}
            onPress={() => {
              onClose()
              onReplace()
            }}
          />
          <ActionRow
            icon="times"
            label="Remove media"
            iconColor={REMOVE_RED}
            labelColor={REMOVE_RED}
            onPress={() => {
              onClose()
              onRemove()
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function ActionRow({
  icon,
  label,
  iconColor = Colors.text.secondary,
  labelColor,
  onPress,
}: {
  icon: ComponentProps<typeof FontAwesome>['name']
  label: string
  iconColor?: string
  labelColor?: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3.5 py-3 active:opacity-80"
    >
      <FontAwesome name={icon} size={18} color={iconColor} />
      <Text
        className="text-[15px] font-medium text-ink"
        style={labelColor ? { color: labelColor } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  )
}
