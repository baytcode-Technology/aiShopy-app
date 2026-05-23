import { Pressable, View, type PressableProps } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = Omit<PressableProps, 'style'> & {
  className?: string
  size?: 'sm' | 'md'
}

export function IconButton({ className, size = 'md', children, ...props }: Props) {
  return (
    <Pressable hitSlop={8} {...props}>
      {({ pressed }) => (
        <View
          className={cn(
            'items-center justify-center rounded-full border border-gray-200 bg-surface',
            size === 'sm' ? 'w-9 h-9' : 'w-10 h-10',
            pressed && 'opacity-80',
            className
          )}
        >
          {children}
        </View>
      )}
    </Pressable>
  )
}
