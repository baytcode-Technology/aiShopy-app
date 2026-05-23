import type { ReactNode } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = Omit<PressableProps, 'style'> & {
  className?: string
  children: ReactNode
}

/** Floating action button — keep className off Pressable (Expo Router + NativeWind). */
export function Fab({ className, children, ...props }: Props) {
  return (
    <View className={cn('absolute right-6 bottom-7 z-10', className)} pointerEvents="box-none">
      <Pressable accessibilityRole="button" {...props}>
        {({ pressed }) => (
          <View
            className="w-[58px] h-[58px] rounded-full bg-brand-primary items-center justify-center border-2 border-ink"
            style={pressed ? { opacity: 0.9, transform: [{ scale: 0.95 }] } : undefined}
          >
            {children}
          </View>
        )}
      </Pressable>
    </View>
  )
}
