import type { ReactNode } from 'react'
import { View } from 'react-native'
import { cn } from '@src/lib/cn'
import { Heading, Muted } from './Typography'

type Props = {
  title: string
  subtitle?: string
  right?: ReactNode
  className?: string
  /** Larger display title */
  large?: boolean
}

export function SectionHeader({ title, subtitle, right, className, large }: Props) {
  return (
    <View className={cn('flex-row items-end justify-between gap-3 mb-4', className)}>
      <View className="flex-1 min-w-0">
        <Heading className={cn('tracking-tight', large ? 'text-[26px]' : 'text-xl')}>
          {title}
        </Heading>
        {subtitle ? (
          <Muted className="mt-1 text-[14px] font-medium text-gray-500">{subtitle}</Muted>
        ) : null}
      </View>
      {right ? <View className="pb-0.5 shrink-0">{right}</View> : null}
    </View>
  )
}
