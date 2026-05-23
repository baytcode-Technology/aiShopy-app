import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { cn } from '@src/lib/cn'

type Props = PressableProps & {
  /** Tailwind on inner View — safe with Expo Router (avoid className on Pressable). */
  containerClassName?: string
  containerStyle?: StyleProp<ViewStyle>
}

export function AppPressable({
  containerClassName,
  containerStyle,
  children,
  style,
  ...props
}: Props) {
  return (
    <Pressable style={[{ width: '100%', alignSelf: 'stretch' }, style]} {...props}>
      <View className={cn('w-full', containerClassName)} style={containerStyle}>
        {children}
      </View>
    </Pressable>
  )
}
