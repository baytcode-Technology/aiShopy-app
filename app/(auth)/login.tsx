import { useState } from 'react'
import { Link, router } from 'expo-router'
import { Alert, StyleSheet, Text } from 'react-native'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Divider } from '@/components/auth/Divider'
import { useAuth } from '@src/contexts/auth-context'
import { theme } from '@src/theme/colors'

export default function LoginScreen() {
  const { sendOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onContinue = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address')
      return
    }

    setError('')
    setLoading(true)
    try {
      await sendOtp(trimmed)
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email: trimmed },
      })
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your email. We will send you a one-time code."
      footer={
        <Text style={styles.footer}>
          New here?{' '}
          <Link href="/(auth)/signup" style={styles.link}>
            Create account
          </Link>
        </Text>
      }
    >
      <GoogleButton />
      <Divider />
      <AuthInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        error={error}
      />
      <AuthButton label="Continue" loading={loading} onPress={onContinue} />
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  footer: {
    fontSize: 14,
    color: theme.gray600,
    fontWeight: '500',
  },
  link: {
    color: theme.black,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
})
