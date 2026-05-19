import FontAwesome from '@expo/vector-icons/FontAwesome'
import { ThemeProvider, DefaultTheme } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'

import Toast from 'react-native-toast-message'
import { AuthProvider } from '@src/contexts/auth-context'
import { StoreProvider } from '@src/contexts/store-context'
import { toastConfig } from '@/components/ui/ToastConfig'
import { theme } from '@src/theme/colors'

export { ErrorBoundary } from 'expo-router'

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.black,
    background: theme.white,
    card: theme.white,
    text: theme.black,
    border: theme.gray200,
  },
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <AuthProvider>
      <StoreProvider>
        <ThemeProvider value={AppTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="store-check" />
            <Stack.Screen name="create-store" />
            <Stack.Screen name="(store)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <Toast config={toastConfig} />
        </ThemeProvider>
      </StoreProvider>
    </AuthProvider>
  )
}
