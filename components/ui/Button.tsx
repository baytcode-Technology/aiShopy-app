import { ActivityIndicator, Pressable, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
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
}

const containerClass: Record<Variant, string> = {
  primary: 'bg-brand-primary border-2 border-brand-primary',
  outline: 'bg-surface border-2 border-brand-primary',
  ghost: 'bg-transparent border-0',
  danger: 'bg-danger border-2 border-danger',
}

const labelClass: Record<Variant, string> = {
  primary: 'text-brand-on-primary',
  outline: 'text-ink',
  ghost: 'text-gray-400 uppercase tracking-widest text-sm',
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
            'w-full items-center justify-center rounded-2xl px-5',
            size === 'lg' ? 'py-5 min-h-[58px]' : 'py-4 min-h-[54px]',
            containerClass[variant],
            isDisabled && 'opacity-55',
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
                size === 'lg' && 'text-lg',
                labelClass[variant],
                labelClassName
              )}
            >
              {label}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  )
}
