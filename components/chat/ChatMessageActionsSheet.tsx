import { Modal, Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { ChatMessage } from '@src/types/chat'
import Colors from '@src/theme/colors'

type Props = {
  visible: boolean
  message: ChatMessage | null
  onClose: () => void
  onForward: (message: ChatMessage) => void
}

export function ChatMessageActionsSheet({ visible, message, onClose, onForward }: Props) {
  if (!message) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable className="bg-surface rounded-t-2xl px-4 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
          <View className="w-10 h-1 rounded-full bg-gray-300 self-center mb-4" />
          <Pressable
            className="flex-row items-center gap-3 py-3.5 border-b border-gray-100"
            onPress={() => {
              onForward(message)
              onClose()
            }}
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <FontAwesome name="mail-forward" size={18} color={Colors.brand.primary} />
            </View>
            <Text className="text-base font-semibold text-ink">Forward</Text>
          </Pressable>
          <Pressable className="py-3 mt-2 items-center" onPress={onClose}>
            <Text className="text-base text-gray-500">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
