import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import Colors from '@src/theme/colors'

/**
 * OAuth return deep link (aishopyapp://instagram-oauth?connected=1&username=...).
 * openAuthSessionAsync on instagram-connect already captures the result;
 * this route only prevents Expo Router from showing +not-found.
 */
WebBrowser.maybeCompleteAuthSession()

export default function InstagramOAuthDeepLinkScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (router.canGoBack()) {
        router.back()
        return
      }
      router.replace('/instagram-connect')
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <ActivityIndicator color={Colors.brand.primary} size="large" />
    </View>
  )
}
