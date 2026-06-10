import type { ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = ViewProps & {
  children: ReactNode
  className?: string
}

/** White card on gray detail canvas — clearer section vs background separation. */
export function DetailSection({ children, className, ...props }: Props) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-gray-300 bg-surface overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </View>
  )
}
