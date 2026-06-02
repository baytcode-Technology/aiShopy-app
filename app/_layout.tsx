import FontAwesome from '@expo/vector-icons/FontAwesome'
import { ThemeProvider, DefaultTheme } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import '../global.css'
import 'react-native-reanimated'

import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { AuthProvider } from '@src/contexts/auth-context'
import { StoreProvider } from '@src/contexts/store-context'
import { toastConfig } from '@/components/ui/ToastConfig'
import Colors from '@src/theme/colors'

export { ErrorBoundary } from 'expo-router'

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.brand.primary,
    background: Colors.bg.primary,
    card: Colors.bg.primary,
    text: Colors.text.primary,
    border: Colors.border.default,
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
    <SafeAreaProvider>
    <AuthProvider>
      <StoreProvider>
        <ThemeProvider value={AppTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="store-check" />
            <Stack.Screen name="create-store" />
            <Stack.Screen name="(store)" />
            <Stack.Screen name="connect-whatsapp" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <Toast config={toastConfig} />
        </ThemeProvider>
      </StoreProvider>
    </AuthProvider>
    </SafeAreaProvider>
  )
}
