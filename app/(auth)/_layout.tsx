import { Stack } from 'expo-router'
import { useAppTheme } from '@src/contexts/theme-context'

export default function AuthLayout() {
  const { colors } = useAppTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="oauth" />
      <Stack.Screen name="google-callback" />
    </Stack>
  )
}
