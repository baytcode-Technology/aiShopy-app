import type { ViewStyle } from 'react-native'
import { getColors, type AppColors } from '@src/theme/colors'

/** Inline shadows — avoid `shadow-*` Tailwind classes on Pressable (breaks navigation). */
export function getShadows(colors: AppColors): Record<string, ViewStyle> {
  const shadowColor = colors.brand.primary
  return {
    sm: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    card: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },
  }
}

export function getFabStyle(colors: AppColors): ViewStyle {
  return {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadows(colors).lg,
  }
}

/** @deprecated Use getShadows(getColors()) for theme-aware shadows. */
export const shadows = new Proxy({} as ReturnType<typeof getShadows>, {
  get(_target, prop: string) {
    return getShadows(getColors())[prop as keyof ReturnType<typeof getShadows>]
  },
})

/** @deprecated Use getFabStyle(getColors()). */
export const fabStyle = new Proxy({} as ViewStyle, {
  get(_target, prop: string) {
    return getFabStyle(getColors())[prop as keyof ViewStyle]
  },
})
