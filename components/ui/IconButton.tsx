import { Pressable, type PressableProps } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = Omit<PressableProps, 'style'> & {
  className?: string
  size?: 'sm' | 'md'
}

export function IconButton({ className, size = 'md', children, ...props }: Props) {
  return (
    <Pressable
      className={cn(
        'items-center justify-center rounded-full border border-gray-200 bg-surface active:opacity-80',
        size === 'sm' ? 'w-9 h-9' : 'w-10 h-10',
        className
      )}
      hitSlop={8}
      {...props}
    >
      {children}
    </Pressable>
  )
}
