import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Redirect, Tabs } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import Colors from '@src/theme/colors'

function TabIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
  focused: boolean
}) {
  return (
    <View className={focused ? 'opacity-100' : 'opacity-70'}>
      <FontAwesome size={21} style={{ marginBottom: -2 }} name={name} color={color} />
    </View>
  )
}

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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.bg.primary,
          borderTopColor: Colors.border.default,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
            chats: 'comments',
            products: 'th-large',
            orders: 'shopping-bag',
            more: 'user',
          }
          return (
            <TabIcon name={icons[route.name] ?? 'circle'} color={color} focused={focused} />
          )
        },
      })}
    >
      <Tabs.Screen name="chats" options={{ title: 'Chats' }} />
      <Tabs.Screen name="products" options={{ title: 'Catalog' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="more" options={{ title: 'Account' }} />
    </Tabs>
  )
}
