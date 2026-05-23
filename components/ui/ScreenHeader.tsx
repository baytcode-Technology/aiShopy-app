import type { ReactNode } from 'react'
import { View } from 'react-native'
import { cn } from '@src/lib/cn'
import { Heading, Subtitle } from './Typography'

type Props = {
  title: string
  subtitle?: string
  right?: ReactNode
  className?: string
  large?: boolean
}

export function ScreenHeader({ title, subtitle, right, className, large = true }: Props) {
  return (
    <View
      className={cn(
        'flex-row items-start justify-between px-6 pt-5 pb-4 bg-surface border-b border-gray-200',
        className
      )}
    >
      <View className="flex-1 pr-4">
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
