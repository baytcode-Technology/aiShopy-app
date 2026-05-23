/**
 * Expo starter themed primitives — wired to global AppColors light/dark.
 */

import { Text as DefaultText, View as DefaultView } from 'react-native'

import AppColors from '@/constants/Colors'
import { useColorScheme } from './useColorScheme'

type ThemeProps = {
  lightColor?: string
  darkColor?: string
}

export type TextProps = ThemeProps & DefaultText['props']
export type ViewProps = ThemeProps & DefaultView['props']

type ThemeName = keyof typeof AppColors.light & keyof typeof AppColors.dark

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeName
) {
  const theme = useColorScheme() ?? 'light'
  const colorFromProps = props[theme]

  if (colorFromProps) {
    return colorFromProps
  }

  return AppColors[theme][colorName]
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')

  return <DefaultText style={[{ color }, style]} {...otherProps} />
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background')

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />
}
