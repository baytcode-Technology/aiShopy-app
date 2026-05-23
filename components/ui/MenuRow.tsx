import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
import { Caption, Muted } from './Typography'

type Props = {
  label: string
  value?: string
  icon?: React.ComponentProps<typeof FontAwesome>['name']
  onPress?: () => void
  showChevron?: boolean
  className?: string
}

export function MenuRow({
  label,
  value,
  icon = 'circle-o',
  onPress,
  showChevron = false,
  className,
}: Props) {
  const content = (
    <View
      className={cn(
        'flex-row items-center gap-4 px-5 py-4 bg-surface border border-gray-200 rounded-2xl',
        className
      )}
    >
      <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
        <FontAwesome name={icon} size={16} color={Colors.brand.primary} />
      </View>
      <View className="flex-1">
        <Caption className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">
          {label}
        </Caption>
        {value ? <Text className="text-[15px] font-semibold text-ink">{value}</Text> : null}
      </View>
      {showChevron ? (
        <FontAwesome name="chevron-right" size={12} color={Colors.text.muted} />
      ) : null}
    </View>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => <View className={pressed ? 'opacity-90' : ''}>{content}</View>}
      </Pressable>
    )
  }

  return content
}
