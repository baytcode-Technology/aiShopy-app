import type { ReactNode } from 'react'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import { cn } from '@src/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  /** Subtle slide-up (default) or fade only */
  variant?: 'slide' | 'fade'
}

export function AnimatedFadeIn({
  children,
  className,
  delay = 0,
  variant = 'slide',
}: Props) {
  const entering =
    variant === 'fade'
      ? FadeIn.delay(delay).duration(380)
      : FadeInDown.delay(delay).duration(420).springify().damping(18)

  return (
    <Animated.View entering={entering} className={className}>
      {children}
    </Animated.View>
  )
}
