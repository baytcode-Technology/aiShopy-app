import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Redirect, Tabs } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import Colors from '@src/theme/colors'

function TabIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} name={name} color={color} />
}

export default function StoreLayout() {
  const { isLoading, isAuthenticated } = useAuth()
  const { store, isLoading: storeLoading } = useStore()

  if (isLoading || storeLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={Colors.brand.primary} />
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.bg.primary,
          borderTopColor: Colors.border.default,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <TabIcon name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <TabIcon name="cube" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <TabIcon name="shopping-cart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <TabIcon name="ellipsis-h" color={color} />,
        }}
      />
    </Tabs>
  )
}
