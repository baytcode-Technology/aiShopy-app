import type { ReactNode } from 'react'
import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native'
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

type ScreenScrollBodyProps = Omit<ScrollViewProps, 'contentContainerStyle'> & {
  children: ReactNode
  className?: string
  contentContainerClassName?: string
}

/** Scrollable body for settings / card pages that can overflow on small screens. */
export function ScreenScrollBody({
  children,
  className,
  contentContainerClassName,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: ScreenScrollBodyProps) {
  return (
    <ScrollView
      className={cn('flex-1', className)}
      contentContainerClassName={cn('px-5 pt-2 pb-8 grow', contentContainerClassName)}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
    >
      {children}
    </ScrollView>
  )
}
