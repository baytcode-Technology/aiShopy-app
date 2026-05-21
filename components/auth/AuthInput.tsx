import { useState } from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import { theme } from '@src/theme/colors'

type Props = TextInputProps & {
  label: string
  error?: string
}

export function AuthInput({ label, error, style, onFocus, onBlur, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.gray400}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          style
        ]}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          onBlur?.(e)
        }}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.gray600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.gray200,
    backgroundColor: theme.gray100,
    color: theme.black,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  inputFocused: {
    borderColor: theme.black,
    backgroundColor: theme.white,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    paddingLeft: 4,
    marginTop: 2,
  },
})
