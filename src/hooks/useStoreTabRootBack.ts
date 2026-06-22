import { useFocusEffect } from '@react-navigation/native'
import { router, type Href } from 'expo-router'
import { useCallback, useRef } from 'react'
import { BackHandler, Platform } from 'react-native'
import { showWarning } from '@src/lib/toast'

const CHATS_ROUTE = '/(store)/chats' as Href
const EXIT_CONFIRM_MS = 2000

type StoreTabName = 'chats' | 'products' | 'orders' | 'dashboard'

/**
 * Android hardware back on store tab roots:
 * - products / orders / dashboard → navigate to Chats
 * - chats → first press shows exit hint, second press within 2s exits the app
 */
export function useStoreTabRootBack(tab: StoreTabName) {
  const lastExitPressRef = useRef(0)

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (tab === 'chats') {
          const now = Date.now()
          if (now - lastExitPressRef.current < EXIT_CONFIRM_MS) {
            BackHandler.exitApp()
            return true
          }
          lastExitPressRef.current = now
          showWarning('Press back again to exit')
          return true
        }

        router.navigate(CHATS_ROUTE)
        return true
      })

      return () => subscription.remove()
    }, [tab])
  )
}
