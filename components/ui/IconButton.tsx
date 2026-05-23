import { Pressable, View, type PressableProps } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = Omit<PressableProps, 'style'> & {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'ghost'
}

export function IconButton({
  className,
  size = 'md',
  variant = 'default',
  children,
  ...props
}: Props) {
  const sizeClass =
    size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10'

  const variantClass =
    variant === 'filled'
      ? 'bg-brand-primary border-brand-primary'
      : variant === 'ghost'
        ? 'bg-transparent border-transparent'
        : 'bg-surface border-gray-200'

  return (
    <Pressable hitSlop={8} {...props}>
      {({ pressed }) => (
        <View
          className={cn(
            'items-center justify-center rounded-full border',
            sizeClass,
            variantClass,
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
