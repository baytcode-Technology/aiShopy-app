import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { theme } from '@src/theme/colors'

type Props = Omit<PressableProps, 'style'> & {
  label: string
  loading?: boolean
  variant?: 'primary' | 'outline'
  style?: StyleProp<ViewStyle>
}

export function AuthButton({
  label,
  loading,
  variant = 'primary',
  disabled,
  style: styleProp,
  ...props
}: Props) {
  const isPrimary = variant === 'primary'

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        styleProp,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.white : theme.black} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelOutline]}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: {
    backgroundColor: theme.black,
  },
  outline: {
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.black,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelPrimary: {
    color: theme.white,
  },
  labelOutline: {
    color: theme.black,
  },
})
