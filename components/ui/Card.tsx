import { Pressable, View, type PressableProps, type ViewProps } from 'react-native'
import { cn } from '@src/lib/cn'

type CardProps = ViewProps & {
  className?: string
  padded?: boolean
  elevated?: boolean
}

export function Card({ className, padded = true, elevated = false, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'bg-surface border border-gray-200 rounded-3xl',
        elevated && 'border-gray-300',
        padded && 'p-4',
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
            'bg-surface border border-gray-200 rounded-3xl',
            padded && 'p-4',
            pressed && 'opacity-90 border-gray-300',
            className
          )}
        >
          {children}
        </View>
      )}
    </Pressable>
  )
}
