import type { ReactNode } from 'react'
import { View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
import { shadows } from '@src/lib/shadows'
import { Body, Heading } from './Typography'

type Props = {
  icon?: React.ComponentProps<typeof FontAwesome>['name']
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon = 'inbox', title, description, action, className }: Props) {
  return (
    <View className={cn('flex-1 items-center justify-center px-10 py-20', className)}>
      <View
        className="w-[72px] h-[72px] rounded-[22px] bg-surface border border-gray-200 items-center justify-center mb-6"
        style={shadows.sm}
      >
        <FontAwesome name={icon} size={26} color={Colors.text.muted} />
      </View>
      <Heading className="text-2xl text-center tracking-tight text-ink">{title}</Heading>
      {description ? (
        <Body className="text-center mt-3 text-gray-500 max-w-[300px] leading-6 text-[15px]">
          {description}
        </Body>
      ) : null}
      {action ? <View className="mt-8 w-full max-w-xs">{action}</View> : null}
    </View>
  )
}
