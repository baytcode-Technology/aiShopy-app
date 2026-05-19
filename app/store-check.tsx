import { useEffect } from 'react'
import { router } from 'expo-router'
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { theme } from '@src/theme/colors'
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
          router.replace('/(tabs)')
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
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.black} />
      <Text style={styles.text}>Checking your store…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.white,
    gap: 16,
  },
  text: {
    fontSize: 14,
    color: theme.gray600,
  },
})
