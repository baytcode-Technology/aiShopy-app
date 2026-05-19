import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import { theme } from '@src/theme/colors'

type Props = TextInputProps & {
  label: string
  error?: string
}

export function AuthInput({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.gray400}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.black,
    backgroundColor: theme.white,
    color: theme.black,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: theme.gray600,
  },
  error: {
    fontSize: 13,
    color: theme.gray600,
  },
})
