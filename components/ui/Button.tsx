import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'

type Props = Omit<PressableProps, 'style'> & {
  label: string
  loading?: boolean
  variant?: Variant
  size?: 'md' | 'lg'
  className?: string
  labelClassName?: string
  style?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
}

const containerClass: Record<Variant, string> = {
  primary: 'bg-brand-primary border-2 border-brand-primary',
  outline: 'bg-surface border-2 border-ink',
  ghost: 'bg-transparent border-0',
  danger: 'bg-charcoal border-2 border-charcoal',
}

const labelClass: Record<Variant, string> = {
  primary: 'text-brand-on-primary',
  outline: 'text-ink',
  ghost: 'text-gray-500 uppercase tracking-[0.14em] text-xs',
  danger: 'text-brand-on-primary',
}

export function Button({
  label,
  loading,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  labelClassName,
  labelStyle,
  style,
  ...props
}: Props) {
  const isDisabled = disabled || loading
  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? Colors.brand.primary
      : Colors.brand.onPrimary

  return (
    <Pressable
      style={[{ width: '100%', alignSelf: 'stretch' }, style]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'w-full items-center justify-center rounded-2xl',
            size === 'lg' ? 'py-[18px] min-h-[56px] px-6' : 'py-4 min-h-[52px] px-5',
            containerClass[variant],
            isDisabled && 'opacity-45',
            pressed && !isDisabled && 'opacity-90',
            className
          )}
        >
          {loading ? (
            <ActivityIndicator color={spinnerColor} />
          ) : (
            <Text
              className={cn(
                'font-bold text-[15px] tracking-wide',
                size === 'lg' && 'text-base',
                labelClass[variant],
                labelClassName
              )}
              style={labelStyle}
            >
              {label}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  )
}
