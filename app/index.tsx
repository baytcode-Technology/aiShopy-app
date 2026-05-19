import { Redirect } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useAuth } from '@src/contexts/auth-context'
import { theme } from '@src/theme/colors'

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.black} />
      </View>
    )
  }

  if (isAuthenticated) {
    return <Redirect href="/store-check" />
  }

  return <Redirect href="/(auth)/login" />
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.white,
  },
})
