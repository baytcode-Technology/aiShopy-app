import type { ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@src/lib/cn'
import { shadows } from '@src/lib/shadows'

type Props = ViewProps & {
  children: ReactNode
  className?: string
}

/** Fixed bottom actions with safe area — use inside a flex-1 screen. */
export function StickyBottomBar({ children, className, ...props }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <View
      className={cn(
        'absolute left-0 right-0 bottom-0 bg-surface border-t border-gray-100 px-5 pt-3',
        className
      )}
      style={[
        shadows.sm,
        {
          paddingBottom: Math.max(insets.bottom, 14),
        },
      ]}
      {...props}
    >
      {children}
    </View>
  )
}
