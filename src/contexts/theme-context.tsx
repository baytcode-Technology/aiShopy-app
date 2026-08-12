import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { View, type ViewStyle } from 'react-native'
import { vars } from 'nativewind'
import { StatusBar } from 'expo-status-bar'
import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native'
import type { ThemeMode } from '@src/theme/palette'
import {
  getActivePalette,
  getColors,
  setActiveThemeMode,
  type AppColors,
} from '@src/theme/colors'
import { paletteToCssVars } from '@src/theme/theme-vars'
import { getStoredThemeMode, setStoredThemeMode } from '@src/lib/theme-storage'

type ThemeContextValue = {
  mode: ThemeMode
  isDark: boolean
  colors: AppColors
  toggleTheme: () => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function buildNavTheme(mode: ThemeMode) {
  const colors = getColors()
  const base = mode === 'dark' ? DarkTheme : DefaultTheme
  return {
    ...base,
    dark: mode === 'dark',
    colors: {
      ...base.colors,
      primary: colors.brand.primary,
      background: colors.bg.primary,
      card: colors.bg.primary,
      text: colors.text.primary,
      border: colors.border.default,
      notification: colors.brand.green,
    },
  }
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light')

  useEffect(() => {
    void getStoredThemeMode().then((stored) => {
      if (stored && stored !== 'light') {
        setActiveThemeMode(stored)
        setModeState(stored)
      }
    })
  }, [])

  const applyMode = useCallback((next: ThemeMode) => {
    setActiveThemeMode(next)
    setModeState(next)
    void setStoredThemeMode(next)
  }, [])

  const toggleTheme = useCallback(() => {
    applyMode(mode === 'light' ? 'dark' : 'light')
  }, [applyMode, mode])

  const setMode = useCallback(
    (next: ThemeMode) => {
      if (next !== mode) applyMode(next)
    },
    [applyMode, mode],
  )

  const colors = getColors()
  const cssVarStyle = useMemo(
    () => vars(paletteToCssVars(getActivePalette())),
    [mode],
  )

  const navTheme = useMemo(() => buildNavTheme(mode), [mode])

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors,
      toggleTheme,
      setMode,
    }),
    [mode, colors, toggleTheme, setMode],
  )

  return (
    <ThemeContext.Provider value={value}>
      <NavThemeProvider value={navTheme}>
        <View style={[{ flex: 1 }, cssVarStyle as ViewStyle]}>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          {children}
        </View>
      </NavThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider')
  }
  return ctx
}
