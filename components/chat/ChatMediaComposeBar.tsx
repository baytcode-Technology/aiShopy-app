import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { IconButton } from '@/components/ui/IconButton'
import Colors from '@src/theme/colors'
import type { OutboundMediaPayload } from '@/components/chat/ChatComposer'

type Props = {
  items: OutboundMediaPayload[]
  caption: string
  onChangeCaption: (value: string) => void
  onRemoveAt: (index: number) => void
  onCancel: () => void
  onSend: () => void
  onAddMore: () => void
  disabled?: boolean
}

function MediaThumb({ item }: { item: OutboundMediaPayload }) {
  if (item.type === 'video') {
    return (
      <View className="w-full h-full bg-gray-800 items-center justify-center">
        <FontAwesome name="play-circle" size={28} color="#ffffff" />
      </View>
    )
  }

  return <Image source={{ uri: item.uri }} className="w-full h-full" resizeMode="cover" />
}

export function ChatMediaComposeBar({
  items,
  caption,
  onChangeCaption,
  onRemoveAt,
  onCancel,
  onSend,
  onAddMore,
  disabled = false,
}: Props) {
  const countLabel = items.length === 1 ? '1 item' : `${items.length} items`

  return (
    <View className="bg-surface border-t border-gray-200">
      <View className="flex-row items-center justify-between px-3 pt-3 pb-2">
        <Pressable onPress={onCancel} disabled={disabled} className="p-1" hitSlop={8}>
          <FontAwesome name="times" size={20} color={Colors.text.muted} />
        </Pressable>
        <Text className="text-sm font-semibold text-ink">{countLabel}</Text>
        <Pressable onPress={onAddMore} disabled={disabled} className="p-1" hitSlop={8}>
          <FontAwesome name="plus" size={18} color={Colors.brand.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-3 pb-3 gap-2"
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item, index) => (
          <View key={`${item.uri}-${index}`} className="relative">
            <View className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 border border-gray-200">
              <MediaThumb item={item} />
            </View>
            <Pressable
              onPress={() => onRemoveAt(index)}
              disabled={disabled}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gray-900/80 items-center justify-center"
              hitSlop={6}
            >
              <FontAwesome name="times" size={12} color="#ffffff" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-end gap-2 px-3 pb-2.5">
        <TextInput
          className="flex-1 min-h-11 max-h-[100px] rounded-full border border-gray-200 bg-gray-100 px-4 py-2.5 text-[15px] text-ink"
          placeholder="Add a caption"
          placeholderTextColor={Colors.text.muted}
          value={caption}
          onChangeText={onChangeCaption}
          multiline
          maxLength={1024}
          editable={!disabled}
        />
        <IconButton
          className="bg-brand-primary border-0 w-11 h-11"
          onPress={onSend}
          disabled={disabled}
        >
          <FontAwesome name="send" size={16} color={Colors.brand.onPrimary} />
        </IconButton>
      </View>
    </View>
  )
}
