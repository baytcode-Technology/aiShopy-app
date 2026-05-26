import { Redirect, Tabs } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { StoreTabBar } from '@/components/navigation/StoreTabBar'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import Colors from '@src/theme/colors'

export default function StoreLayout() {
  const { isLoading, isAuthenticated } = useAuth()
  const { store, isLoading: storeLoading } = useStore()

  if (isLoading || storeLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={Colors.brand.primary} size="large" />
      </View>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  if (!store) {
    return <Redirect href="/store-check" />
  }

  return (
    <Tabs
      tabBar={(props) => <StoreTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="chats" options={{ title: 'Chats' }} />
      <Tabs.Screen name="products" options={{ title: 'Catalog' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="more" options={{ title: 'Account' }} />
    </Tabs>
  )
}
