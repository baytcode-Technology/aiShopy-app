import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
import { Heading, Subtitle } from './Typography'

type Props = {
  title: string
  subtitle?: string
  right?: ReactNode
  onBack?: () => void
  className?: string
  large?: boolean
}

export function ScreenHeader({ title, subtitle, right, onBack, className, large = true }: Props) {
  return (
    <View
      className={cn(
        'flex-row items-start justify-between px-6 pt-5 pb-4 bg-surface border-b border-gray-200',
        className
      )}
    >
      <View className="flex-1 pr-4">
        {onBack ? (
          <Pressable onPress={onBack} className="flex-row items-center gap-2 mb-2 -ml-1" hitSlop={8}>
            <FontAwesome name="chevron-left" size={14} color={Colors.brand.primary} />
            <Subtitle className="text-ink font-semibold text-sm">Back</Subtitle>
          </Pressable>
        ) : null}
        <Heading className={cn(large ? 'text-[28px]' : 'text-xl', 'tracking-tight')}>
          {title}
        </Heading>
        {subtitle ? (
          <Subtitle className="mt-1.5 text-gray-500 text-[15px]">{subtitle}</Subtitle>
        ) : null}
      </View>
      {right ? <View className="pt-1">{right}</View> : null}
    </View>
  )
}
