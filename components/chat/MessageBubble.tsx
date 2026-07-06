import { Text, View } from 'react-native'
import { Caption } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import { FormattedMessageText } from '@src/lib/parse-inline-markdown'
import type { ChatMessage } from '@src/types/chat'

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
        {outgoing ? (
          <Text
            className={cn(
              'text-[15px] leading-[21px]',
              'text-brand-on-primary'
            )}
          >
            {message.text}
          </Text>
        ) : (
          <FormattedMessageText
            text={message.text}
            className="text-[15px] leading-[21px] text-ink"
          />
        )}
        <Caption className={cn('self-end', outgoing ? 'text-gray-400' : 'text-gray-400')}>
          {message.time}
          {outgoing && message.status ? ` · ${message.status}` : ''}
          {message.pending ? ' · sending…' : ''}
        </Caption>
      </View>
    </View>
  )
}
