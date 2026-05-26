import type { ReactNode } from 'react'
import { View } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  /** @deprecated No animation — kept for API compatibility */
  delay?: number
  /** @deprecated No animation — kept for API compatibility */
  variant?: 'slide' | 'fade'
}

/** Static wrapper (animations disabled). */
export function AnimatedFadeIn({ children, className }: Props) {
  return <View className={className}>{children}</View>
}
