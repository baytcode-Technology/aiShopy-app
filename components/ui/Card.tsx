import { Pressable, View, type PressableProps, type ViewProps } from 'react-native'
import { cn } from '@src/lib/cn'

type CardProps = ViewProps & {
  className?: string
  padded?: boolean
}

export function Card({ className, padded = true, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'bg-surface border border-gray-200 rounded-2xl shadow-sm',
        padded && 'p-3.5',
        className
      )}
      {...props}
    >
      {children}
    </View>
  )
}

type PressableCardProps = Omit<PressableProps, 'style'> & {
  className?: string
  padded?: boolean
}

export function PressableCard({
  className,
  padded = true,
  children,
  ...props
}: PressableCardProps) {
  return (
    <Pressable {...props}>
      {({ pressed }) => (
        <View
          className={cn(
            'bg-surface border border-gray-200 rounded-2xl shadow-sm',
            padded && 'p-3.5',
            pressed && 'opacity-92',
            className
          )}
        >
          {children}
        </View>
      )}
    </Pressable>
  )
}
