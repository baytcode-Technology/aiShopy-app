import { useState } from 'react'
import { Text, TextInput, View, type TextInputProps, type StyleProp, type ViewStyle } from 'react-native'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
import { Label } from './Typography'

type Props = TextInputProps & {
  label: string
  error?: string
  containerClassName?: string
  inputClassName?: string
  containerStyle?: StyleProp<ViewStyle>
}

export function Input({
  label,
  error,
  className,
  containerClassName,
  inputClassName,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <View className={cn('gap-1.5 mb-1 w-full', containerClassName)} style={containerStyle}>
      <Label>{label}</Label>
      <TextInput
        placeholderTextColor={Colors.text.muted}
        selectionColor={Colors.brand.primary}
        className={cn(
          'w-full border rounded-2xl px-4 py-3.5 text-[15px] font-medium text-ink bg-gray-100 border-gray-200',
          focused && 'border-ink bg-surface',
          error && 'border-danger bg-danger-bg',
          inputClassName,
          className
        )}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...props}
      />
      {error ? (
        <Text className="text-xs font-bold text-danger uppercase pl-1 mt-0.5">{error}</Text>
      ) : null}
    </View>
  )
}
