import { useState } from 'react'
import {
  LayoutChangeEvent,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { cn } from '@src/lib/cn'
import Colors from '@src/theme/colors'
import { Label } from './Typography'

type Props = TextInputProps & {
  label: string
  error?: string
  containerClassName?: string
  inputClassName?: string
  containerStyle?: StyleProp<ViewStyle>
  /** Layout callback for scrolling to the first invalid field. */
  containerOnLayout?: (event: LayoutChangeEvent) => void
}

export function Input({
  label,
  error,
  className,
  containerClassName,
  inputClassName,
  containerStyle,
  containerOnLayout,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <View
      className={cn('gap-2 mb-0.5 w-full', containerClassName)}
      style={containerStyle}
      onLayout={containerOnLayout}
    >
      <Label>{label}</Label>
      <TextInput
        placeholderTextColor={Colors.text.muted}
        selectionColor={Colors.brand.primary}
        className={cn(
          'w-full border rounded-2xl px-4 py-3.5 text-[15px] font-medium text-ink bg-gray-50 border-gray-200',
          focused && 'border-ink bg-surface',
          error && 'border-[#E11D48] bg-[#FFF1F2]',
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
        <Text className="text-[11px] font-semibold text-[#E11D48] uppercase tracking-wide pl-0.5 mt-0.5">
          {error}
        </Text>
      ) : null}
    </View>
  )
}
