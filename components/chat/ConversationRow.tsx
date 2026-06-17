import { Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AppPressable } from '@/components/ui/AppPressable'
import { UnreadCountBadge } from '@/components/ui/UnreadCountBadge'
import { Caption, Muted } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import type { ChatListItem } from '@src/types/chat'

type Props = {
  conversation: ChatListItem
  onPress: () => void
}

export function ConversationRow({ conversation, onPress }: Props) {
  return (
    <AppPressable
      containerClassName="flex-row items-center px-4 py-3.5 gap-3 bg-surface border-b border-gray-200"
      onPress={onPress}
    >
      <View className="relative">
        <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
          <Text className="text-base font-bold text-gray-600">{conversation.initials}</Text>
        </View>
        {conversation.online ? (
          <View className="absolute right-0.5 bottom-0.5 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-surface" />
        ) : null}
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 flex-row items-center gap-1.5 mr-2 min-w-0">
            {conversation.channel === 'instagram' ? (
              <FontAwesome name="instagram" size={14} color={Colors.brand.primary} />
            ) : null}
            <Text className="flex-1 text-base font-bold text-ink" numberOfLines={1}>
              {conversation.title}
            </Text>
          </View>
          <Caption>{conversation.time}</Caption>
        </View>
        <View className="flex-row items-center gap-2">
          <Muted className="flex-1" numberOfLines={1}>
            {conversation.subtitle}
          </Muted>
          {conversation.unread > 0 ? (
            <UnreadCountBadge count={conversation.unread} />
          ) : null}
        </View>
      </View>
    </AppPressable>
  )
}
