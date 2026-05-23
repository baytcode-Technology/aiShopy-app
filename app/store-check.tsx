import { useEffect } from 'react'
import { router, type Href } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { Muted } from '@/components/ui/Typography'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import Colors from '@src/theme/colors'
import { showError } from '@src/lib/toast'
import { getErrorMessage } from '@src/lib/api-error'

export default function StoreCheckScreen() {
  const { isAuthenticated } = useAuth()
  const { refreshStore } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login')
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const { hasStore } = await refreshStore()
        if (cancelled) return

        if (hasStore) {
          router.replace('/(store)/chats' as Href)
        } else {
          router.replace('/create-store')
        }
      } catch (e) {
        if (cancelled) return
        showError(e, getErrorMessage(e, 'Could not load your store'))
        router.replace('/(auth)/login')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, refreshStore])

  return (
    <View className="flex-1 items-center justify-center bg-surface gap-4">
      <ActivityIndicator size="large" color={Colors.brand.primary} />
      <Muted className="font-semibold tracking-wide">Checking your store…</Muted>
    </View>
  )
}
