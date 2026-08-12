import { Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { ComponentProps } from 'react'
import { AppPressable } from '@/components/ui/AppPressable'
import { UnreadCountBadge } from '@/components/ui/UnreadCountBadge'
import { Caption, Muted } from '@/components/ui/Typography'
import Colors from '@src/theme/colors'
import type { ChatChannel, ChatListItem } from '@src/types/chat'
import { useAppTheme } from '@src/contexts/theme-context'

const CHANNEL_AVATAR: Record<
  ChatChannel,
  { icon: ComponentProps<typeof FontAwesome>['name']; bg: string }
> = {
  whatsapp: { icon: 'whatsapp', bg: '#25D366' },
  instagram: { icon: 'instagram', bg: '#E1306C' },
}

type Props = {
  conversation: ChatListItem
  onPress: () => void
}

export function ConversationRow({ conversation, onPress }: Props) {
  const avatar = CHANNEL_AVATAR[conversation.channel]
  const { isDark } = useAppTheme()

  return (
    <AppPressable
      containerClassName="flex-row items-center px-4 py-3.5 gap-3 bg-surface border-b border-gray-200"
      onPress={onPress}
      accessibilityLabel={`${conversation.channel} conversation with ${conversation.title}`}
    >
      <View className="relative">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: avatar.bg }}
        >
          <FontAwesome name={avatar.icon} size={22} color="#FFFFFF" />
        </View>
        {conversation.online ? (
          <View className="absolute right-0.5 bottom-0.5 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-surface" />
        ) : null}
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 flex-row items-center gap-1.5 mr-2 min-w-0">
            <Text className="flex-1 text-base font-bold text-ink" numberOfLines={1}>
              {conversation.title}
            </Text>
            {conversation.aiHandling ? (
              <FontAwesome name="magic" size={12} color={Colors.brand.primary} accessibilityLabel="AI replying" />
            ) : null}
          </View>
          <Caption className={isDark ? 'text-gray-400' : undefined}>
            {conversation.time}
          </Caption>
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
