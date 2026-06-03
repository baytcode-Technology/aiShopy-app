import type { ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { cn } from '@src/lib/cn'

type Props = ViewProps & {
  children: ReactNode
  edges?: Edge[]
  /** White canvas instead of gray shell */
  variant?: 'canvas' | 'shell'
}

export function Screen({ children, className, edges = ['top'], variant = 'shell', ...props }: Props) {
  return (
    <SafeAreaView
      className={cn('flex-1', variant === 'canvas' ? 'bg-surface' : 'bg-gray-100', className)}
      edges={edges}
      {...props}
    >
      {children}
    </SafeAreaView>
  )
}

export function ScreenBody({ children, className, ...props }: ViewProps) {
  return (
    <View className={cn('flex-1', className)} {...props}>
      {children}
    </View>
  )
}
