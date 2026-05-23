import type { ReactNode } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = Omit<PressableProps, 'style'> & {
  className?: string
  children: ReactNode
}

export function Fab({ className, children, ...props }: Props) {
  return (
    <Pressable className={cn('absolute right-5 bottom-6', className)} {...props}>
      {({ pressed }) => (
        <View
          className={cn(
            'w-14 h-14 rounded-full bg-brand-primary items-center justify-center border-2 border-brand-primary',
            pressed && 'opacity-90'
          )}
        >
          {children}
        </View>
      )}
    </Pressable>
  )
}
