import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
  visible: boolean
  imageUri: string | null
  title?: string
  onClose: () => void
}

export function VariantImagePreviewModal({
  visible,
  imageUri,
  title = 'Variant image',
  onClose,
}: Props) {
  const insets = useSafeAreaInsets()
  if (!imageUri) return null

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-ink">
        <View
          className="flex-row items-center justify-between px-4 pb-3"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable onPress={onClose} hitSlop={12}>
            <View className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
              <FontAwesome name="times" size={18} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text className="text-[16px] font-bold text-white">{title}</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    height: '100%',
    maxHeight: 560,
  },
})
