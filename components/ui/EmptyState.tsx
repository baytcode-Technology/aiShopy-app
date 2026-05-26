import type { ReactNode } from 'react'
import { View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
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
    <View className={cn('flex-1 items-center justify-center px-10 py-16', className)}>
      <View className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 items-center justify-center mb-5">
        <FontAwesome name={icon} size={24} color={Colors.text.muted} />
      </View>
      <Heading className="text-xl text-center tracking-tight">{title}</Heading>
      {description ? (
        <Body className="text-center mt-2 text-gray-500 max-w-[280px]">{description}</Body>
      ) : null}
      {action ? <View className="mt-6 w-full max-w-xs">{action}</View> : null}
    </View>
  )
}
