import type React from 'react'
import {
  Pressable,
  View,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { cn } from '@src/lib/cn'

type Props = Omit<PressableProps, 'style' | 'children'> & {
  /** Tailwind on inner View — safe with Expo Router (avoid className on Pressable). */
  containerClassName?: string
  containerStyle?: StyleProp<ViewStyle>
  style?: PressableProps['style']
  children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode)
}

export function AppPressable({
  containerClassName,
  containerStyle,
  children,
  style,
  ...props
}: Props) {
  return (
    <Pressable
      style={(state) => [
        { width: '100%', alignSelf: 'stretch' },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {(state) => (
        <View className={cn('w-full', containerClassName)} style={containerStyle}>
          {typeof children === 'function' ? children(state) : children}
        </View>
      )}
    </Pressable>
  )
}
