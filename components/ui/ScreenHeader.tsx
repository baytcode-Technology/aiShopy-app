import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AppLogo } from '@/components/brand/AppLogo'
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
  /** Show AISHOPY logo above the title (main app screens). */
  showLogo?: boolean
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
  className,
  large = true,
  showLogo = false,
}: Props) {
  return (
    <View className={cn('px-5 pt-4 pb-3 bg-surface', className)}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 min-w-0 pr-2">
          {showLogo && !onBack ? (
            <AppLogo variant="wordmark" className="mb-3" />
          ) : null}
          {onBack ? (
            <Pressable
              onPress={onBack}
              className="flex-row items-center gap-1.5 mb-3 self-start py-1 -ml-1"
              hitSlop={10}
            >
              <FontAwesome name="chevron-left" size={13} color={Colors.text.secondary} />
              <Subtitle className="text-gray-500 font-semibold text-[13px]">Back</Subtitle>
            </Pressable>
          ) : null}
          <Heading className={cn(large ? 'text-[32px] leading-tight' : 'text-xl', 'tracking-tight')}>
            {title}
          </Heading>
          {subtitle ? (
            <Subtitle className="mt-2 text-gray-500 text-[15px] font-medium leading-5">{subtitle}</Subtitle>
          ) : null}
        </View>
        {right ? <View className="pt-1 shrink-0">{right}</View> : null}
      </View>
    </View>
  )
}
