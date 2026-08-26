import { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useNativeAppleSignIn } from '@src/hooks/use-native-apple-sign-in'

/** Official Apple button (iOS only). Hidden on Android/web and when SIWA is unavailable. */
export function AppleButton() {
  const { signIn, loading } = useNativeAppleSignIn()
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'ios') return
    void AppleAuthentication.isAvailableAsync().then(setAvailable)
  }, [])

  if (Platform.OS !== 'ios' || !available) {
    return null
  }

  return (
    <View className="w-full min-h-[52px]" style={{ opacity: loading ? 0.6 : 1 }}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={16}
        style={{ width: '100%', height: 52 }}
        onPress={() => {
          if (loading) return
          void signIn()
        }}
      />
    </View>
  )
}
