import { useEffect } from 'react'
import { BackHandler, Platform } from 'react-native'
import { router, type Href } from 'expo-router'

export function useNavigateBackTo(href: Href) {
  useEffect(() => {
    if (Platform.OS !== 'android') return

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      router.navigate(href)
      return true
    })

    return () => subscription.remove()
  }, [href])
}
