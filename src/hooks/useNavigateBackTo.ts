import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { BackHandler, Platform } from 'react-native'
import { router, type Href } from 'expo-router'

export function useNavigateBackTo(href: Href) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.navigate(href)
        }
        return true
      })

      return () => subscription.remove()
    }, [href])
  )
}
