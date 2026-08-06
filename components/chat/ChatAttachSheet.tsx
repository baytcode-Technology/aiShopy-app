import { Modal, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'

type AttachIcon = 'picture-o' | 'video-camera' | 'camera'

type Props = {
  visible: boolean
  onClose: () => void
  onPickPhoto: () => void
  onPickVideo: () => void
  onOpenCamera: () => void
}

function AttachTile({
  label,
  icon,
  backgroundColor,
  onPress,
}: {
  label: string
  icon: AttachIcon
  backgroundColor: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-2 py-3"
      accessibilityLabel={label}
    >
      <View
        className="w-14 h-14 rounded-full items-center justify-center"
        style={{ backgroundColor }}
      >
        <FontAwesome name={icon} size={22} color="#ffffff" />
      </View>
      <Text className="text-sm font-medium text-ink text-center">{label}</Text>
    </Pressable>
  )
}

export function ChatAttachSheet({
  visible,
  onClose,
  onPickPhoto,
  onPickVideo,
  onOpenCamera,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable
          className="bg-surface rounded-t-2xl px-4 pt-4 pb-8"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-10 h-1 rounded-full bg-gray-300 self-center mb-4" />

          <Text className="text-lg font-bold text-ink">Send media</Text>
          <Text className="text-sm text-gray-500 mt-1 mb-4">
            Choose photos, videos, or open the camera
          </Text>

          <View className="flex-row gap-2 px-1 py-2">
            <AttachTile
              label="Photo"
              icon="picture-o"
              backgroundColor="#25D366"
              onPress={onPickPhoto}
            />
            <AttachTile
              label="Video"
              icon="video-camera"
              backgroundColor="#7C3AED"
              onPress={onPickVideo}
            />
            <AttachTile
              label="Camera"
              icon="camera"
              backgroundColor="#2563EB"
              onPress={onOpenCamera}
            />
          </View>

          <Pressable className="py-3 mt-3 items-center border-t border-gray-100" onPress={onClose}>
            <Text className="text-base text-gray-500 font-medium">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
