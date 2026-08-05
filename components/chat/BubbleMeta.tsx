import { Caption } from '@/components/ui/Typography'
import { cn } from '@src/lib/cn'
import type { ChatMessage } from '@src/types/chat'

type Props = {
  message: ChatMessage
  outgoing: boolean
  overlay?: boolean
}

export function BubbleMeta({ message, outgoing, overlay }: Props) {
  return (
    <Caption
      className={cn(
        'self-end',
        overlay ? 'text-white/90' : outgoing ? 'text-gray-400' : 'text-gray-400',
      )}
    >
      {message.time}
      {outgoing && message.status ? ` · ${message.status}` : ''}
      {message.pending ? ' · sending…' : ''}
    </Caption>
  )
}
