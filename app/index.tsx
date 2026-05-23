import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@src/contexts/auth-context'
import Colors from '@src/theme/colors'

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    )
  }

  if (isAuthenticated) {
    return <Redirect href="/store-check" />
  }

  return <Redirect href="/(auth)/login" />
}
