import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
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
}

const variantClasses: Record<Variant, { container: string; label: string; spinner: string }> = {
  primary: {
    container: 'bg-brand-primary shadow-lg shadow-ink/20',
    label: 'text-brand-on-primary',
    spinner: Colors.brand.onPrimary,
  },
  outline: {
    container: 'bg-surface border-2 border-ink',
    label: 'text-ink',
    spinner: Colors.brand.primary,
  },
  ghost: {
    container: 'bg-transparent',
    label: 'text-gray-400 uppercase tracking-widest text-sm',
    spinner: Colors.text.muted,
  },
  danger: {
    container: 'bg-danger',
    label: 'text-brand-on-primary',
    spinner: Colors.brand.onPrimary,
  },
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
  const v = variantClasses[variant]
  const isDisabled = disabled || loading

  return (
    <Pressable
      className={cn(
        'w-full items-center justify-center rounded-2xl',
        size === 'lg' ? 'py-5 min-h-[58px]' : 'py-4 min-h-[54px]',
        v.container,
        isDisabled && 'opacity-50 shadow-none',
        className
      )}
      style={style}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <Text
          className={cn(
            'font-bold text-[15px] tracking-wide',
            size === 'lg' && 'text-lg',
            v.label,
            labelClassName
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}
