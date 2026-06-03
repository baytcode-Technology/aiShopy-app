import { Alert, Platform, Text, View } from 'react-native'
import { router } from 'expo-router'
import { AppPressable } from '@/components/ui/AppPressable'
import { GoogleIcon } from '@/components/auth/GoogleIcon'
import { isGoogleSignInConfigured } from '@src/config/env'
import { useNativeGoogleSignIn } from '@src/hooks/use-native-google-sign-in'

export function GoogleButton() {
  const { signIn: signInNative, loading: nativeLoading } = useNativeGoogleSignIn()
  const googleLoading = Platform.OS !== 'web' && nativeLoading

  const onPress = () => {
    if (!isGoogleSignInConfigured()) {
      Alert.alert(
        'Google sign-in not configured',
        'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file.'
      )
      return
    }

    if (Platform.OS === 'web') {
      router.push({
        pathname: '/(auth)/oauth',
        params: { start: '1' },
      })
      return
    }

    void signInNative()
  }

  const disabled = googleLoading || !isGoogleSignInConfigured()

  return (
    <AppPressable
      containerClassName={`flex-row items-center justify-center border border-gray-200 bg-gray-50 py-4 px-4 rounded-2xl gap-3 min-h-[52px] ${disabled ? 'opacity-60' : ''}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ disabled }}
    >
      <View className="w-6 items-center">
        <GoogleIcon size={20} />
      </View>
      <Text className="text-[15px] font-semibold text-ink">
        {googleLoading ? 'Signing in…' : 'Continue with Google'}
      </Text>
    </AppPressable>
  )
}
