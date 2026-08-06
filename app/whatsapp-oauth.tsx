import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import Colors from '@src/theme/colors'

/**
 * OAuth return deep link (aishopyapp://whatsapp-oauth?code=...).
 * openAuthSessionAsync on connect-whatsapp already captures the code;
 * this route only prevents Expo Router from showing +not-found.
 */
WebBrowser.maybeCompleteAuthSession()

export default function WhatsAppOAuthDeepLinkScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (router.canGoBack()) {
        router.back()
        return
      }
      router.replace('/connect-whatsapp')
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <ActivityIndicator color={Colors.brand.primary} size="large" />
    </View>
  )
}
