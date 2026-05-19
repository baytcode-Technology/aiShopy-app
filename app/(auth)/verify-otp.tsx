import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Alert, Pressable, StyleSheet, Text } from 'react-native'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@src/contexts/auth-context'
import { theme } from '@src/theme/colors'

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const { verifyOtp, sendOtp } = useAuth()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')

  const emailValue = typeof email === 'string' ? email : ''

  const onVerify = async () => {
    const code = otp.trim()
    if (code.length < 6) {
      setError('Enter the 6-digit code from your email')
      return
    }
    if (!emailValue) {
      Alert.alert('Error', 'Email is missing. Go back and try again.')
      router.replace('/(auth)/login')
      return
    }

    setError('')
    setLoading(true)
    try {
      await verifyOtp(emailValue, code)
      router.replace('/store-check')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (!emailValue) return
    setResending(true)
    try {
      await sendOtp(emailValue)
      Alert.alert('Sent', 'A new code has been sent to your email.')
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout
      title="Enter code"
      subtitle={`We sent a verification code to ${emailValue || 'your email'}.`}
      footer={
        <Pressable onPress={() => router.back()} disabled={loading}>
          <Text style={styles.back}>Change email</Text>
        </Pressable>
      }
    >
      <AuthInput
        label="Verification code"
        value={otp}
        onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 8))}
        placeholder="123456"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        error={error}
      />
      <AuthButton label="Verify & continue" loading={loading} onPress={onVerify} />
      <AuthButton
        label={resending ? 'Sending…' : 'Resend code'}
        variant="outline"
        loading={resending}
        disabled={loading}
        onPress={onResend}
      />
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  back: {
    fontSize: 14,
    color: theme.black,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
