import { Text, View } from 'react-native'
import { Caption } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import type { ChatMessage } from '@src/data/dummy-chats'

type Props = {
  message: ChatMessage
}

export function MessageBubble({ message }: Props) {
  const outgoing = message.outgoing

  return (
    <View
      className={cn('mb-3 max-w-[82%]', outgoing ? 'self-end' : 'self-start')}
    >
      <View
        className={cn(
          'rounded-2xl px-3.5 py-2.5 gap-1',
          outgoing
            ? 'bg-brand-primary'
            : 'bg-surface border border-gray-200'
        )}
      >
        <Text
          className={cn(
            'text-[15px] leading-[21px]',
            outgoing ? 'text-brand-on-primary' : 'text-ink'
          )}
        >
          {message.text}
        </Text>
        <Caption className={cn('self-end', outgoing ? 'text-gray-400' : 'text-gray-400')}>
          {message.time}
        </Caption>
      </View>
    </View>
  )
}
