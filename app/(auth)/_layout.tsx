import { Stack } from 'expo-router'
import Colors from '@src/theme/colors'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg.primary },
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
