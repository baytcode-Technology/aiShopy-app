import { useEffect } from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Redirect, Tabs } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@src/contexts/auth-context'
import { useStore } from '@src/contexts/store-context'
import { theme } from '@src/theme/colors'

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) {
  return <FontAwesome size={24} style={{ marginBottom: -2 }} {...props} />
}

export default function TabLayout() {
  const { isLoading, isAuthenticated } = useAuth()
  const { store, isLoading: storeLoading } = useStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Guard handled by Redirect below
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.black} />
      </View>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  if (storeLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.black} />
      </View>
    )
  }

  if (!store) {
    return <Redirect href="/store-check" />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.black,
        tabBarInactiveTintColor: theme.gray400,
        tabBarStyle: {
          backgroundColor: theme.white,
          borderTopColor: theme.gray200,
        },
        headerStyle: { backgroundColor: theme.white },
        headerTintColor: theme.black,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: store?.name ?? 'Home',
          headerTitle: store?.slug ?? 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <TabBarIcon name="ellipsis-h" color={color} />,
        }}
      />
    </Tabs>
  )
}
