import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { AppLogo } from '@/components/brand/AppLogo'
import { HeaderActionsRow } from '@/components/navigation/HeaderActionsRow'
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
  /**
   * `tab` matches the Chats tab header title sizing.
   * `default` is the larger marketing-style header.
   */
  variant?: 'default' | 'tab'
  /** Show AISHOPY wordmark above the title (tab screens). */
  showLogo?: boolean
  /** Show the settings cog in the top-right (default true). */
  showSettings?: boolean
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
  className,
  large = true,
  variant = 'default',
  showLogo = false,
  showSettings = true,
}: Props) {
  const isTab = variant === 'tab'

  const headerActions =
    right || showSettings ? (
      <HeaderActionsRow showSettings={showSettings}>{right}</HeaderActionsRow>
    ) : null

  // Back headers are always left-aligned.
  if (onBack) {
    return (
      <View className={cn(isTab ? 'px-5 pt-4 pb-3 bg-surface' : 'px-5 pt-4 pb-3 bg-surface', className)}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 min-w-0 pr-2">
            <Pressable
              onPress={onBack}
              className="flex-row items-center gap-1.5 mb-3 self-start py-1 -ml-1"
              hitSlop={10}
            >
              <FontAwesome name="chevron-left" size={13} color={Colors.text.secondary} />
              <Subtitle className="text-gray-500 font-semibold text-[13px]">Back</Subtitle>
            </Pressable>
            <Heading
              className={cn(
                isTab ? 'text-2xl' : large ? 'text-[32px] leading-tight' : 'text-xl',
                'tracking-tight'
              )}
            >
              {title}
            </Heading>
            {subtitle ? (
              <Subtitle className="mt-2 text-gray-500 text-[15px] font-medium leading-5">
                {subtitle}
              </Subtitle>
            ) : null}
          </View>
          {headerActions ? <View className="pt-1 shrink-0">{headerActions}</View> : null}
        </View>
      </View>
    )
  }

  // Tab header: match Chats layout (left title, optional right action),
  // and place the AISHOPY wordmark centered within the header width.
  if (isTab) {
    return (
      <View
        className={cn(
          showLogo ? 'px-5 pt-1 pb-3 bg-surface' : 'px-5 py-4 bg-surface',
          className
        )}
      >
        <View className="relative">
          {showLogo ? (
            <View pointerEvents="none" className="absolute left-0 right-0 top-0 items-center">
              <AppLogo variant="wordmark" align="center" />
            </View>
          ) : null}

          <View
            className={cn(
              'flex-row items-center justify-between',
              showLogo ? 'mt-5' : undefined
            )}
          >
            <View className="flex-1 pr-3">
              <Heading className="text-2xl tracking-tight">{title}</Heading>
              {subtitle ? (
                <Subtitle className="mt-1.5 text-gray-500 text-[14px] font-medium leading-5">
                  {subtitle}
                </Subtitle>
              ) : null}
            </View>
            {headerActions ? <View className="shrink-0">{headerActions}</View> : null}
          </View>
        </View>
      </View>
    )
  }

  // Default (non-tab) header
  return (
    <View className={cn('px-5 pt-4 pb-3 bg-surface', className)}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 min-w-0 pr-2">
          {showLogo ? <AppLogo variant="wordmark" className="mb-3" /> : null}
          <Heading className={cn(large ? 'text-[32px] leading-tight' : 'text-xl', 'tracking-tight')}>
            {title}
          </Heading>
          {subtitle ? (
            <Subtitle className="mt-2 text-gray-500 text-[15px] font-medium leading-5">
              {subtitle}
            </Subtitle>
          ) : null}
        </View>
        {headerActions ? <View className="pt-1 shrink-0">{headerActions}</View> : null}
      </View>
    </View>
  )
}
