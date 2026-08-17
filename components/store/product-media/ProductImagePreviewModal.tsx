import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ProductMediaItem } from '@src/lib/product-media'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  item: ProductMediaItem | null
  onClose: () => void
  onDelete: () => void
  onSetCover?: () => void
}

export function ProductImagePreviewModal({
  visible,
  item,
  onClose,
  onDelete,
  onSetCover,
}: Props) {
  const insets = useSafeAreaInsets()

  if (!item) return null

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-ink">
        <View
          className="flex-row items-center justify-between px-4 pb-3"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable onPress={onClose} hitSlop={12}>
            <View className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
              <FontAwesome name="times" size={20} color={Colors.brand.onPrimary} />
            </View>
          </Pressable>
          <Text className="text-brand-on-primary text-base font-bold">Preview</Text>
          <View className="w-10" />
        </View>

        <View className="flex-1 justify-center px-4">
          <Image source={{ uri: item.uri }} style={styles.preview} resizeMode="contain" />
        </View>

        <View
          className="flex-row items-center justify-center gap-3 px-4 pt-3 border-t border-white/10"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          {onSetCover ? (
            <PreviewAction icon="star" label="Cover" onPress={onSetCover} />
          ) : null}
          <PreviewAction icon="trash" label="Delete" onPress={onDelete} danger />
        </View>
      </View>
    </Modal>
  )
}

function PreviewAction({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name']
  label: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <Pressable onPress={onPress} className="items-center min-w-[72px]">
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-1.5"
        style={{ backgroundColor: danger ? '#FEE2E2' : 'rgba(255,255,255,0.15)' }}
      >
        <FontAwesome
          name={icon}
          size={18}
          color={danger ? '#EF4444' : Colors.brand.onPrimary}
        />
      </View>
      <Text
        className="text-xs font-semibold"
        style={{ color: danger ? '#FCA5A5' : Colors.brand.onPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    height: '100%',
    maxHeight: 520,
  },
})
