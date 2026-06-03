import type { ReactNode } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import { cn } from '@src/lib/cn'
import { shadows } from '@src/lib/shadows'

type Props = Omit<PressableProps, 'style'> & {
  className?: string
  children: ReactNode
}

/** Floating action — black circle, soft elevation (className off Pressable). */
export function Fab({ className, children, ...props }: Props) {
  return (
    <View className={cn('absolute right-5 bottom-6 z-10', className)} pointerEvents="box-none">
      <Pressable accessibilityRole="button" {...props}>
        {({ pressed }) => (
          <View
            className="w-[60px] h-[60px] rounded-full bg-brand-primary items-center justify-center border border-gray-200"
            style={[shadows.lg, pressed ? { opacity: 0.92, transform: [{ scale: 0.96 }] } : undefined]}
          >
            {children}
          </View>
        )}
      </Pressable>
    </View>
  )
}

/** Alias for semantic naming in catalog screens. */
export const FloatingButton = Fab
