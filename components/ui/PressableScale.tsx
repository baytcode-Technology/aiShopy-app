import type { ReactNode } from 'react'
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { cn } from '@src/lib/cn'

const spring = { damping: 18, stiffness: 280 }

type Props = Omit<PressableProps, 'style'> & {
  children: ReactNode
  /** Tailwind on animated inner wrapper */
  className?: string
  style?: StyleProp<ViewStyle>
}

/** Subtle scale on press — keep `className` off the raw `Pressable`. */
export function PressableScale({ children, className, style, disabled, ...props }: Props) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      onPressIn={() => {
        if (!disabled) scale.value = withSpring(0.97, spring)
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring)
      }}
      {...props}
    >
      <Animated.View className={cn('w-full', className)} style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  )
}
