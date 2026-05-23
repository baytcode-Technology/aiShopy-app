import type { ViewStyle } from 'react-native'
import Colors from '@src/theme/colors'

/** Inline shadows — avoid `shadow-*` Tailwind classes on Pressable (breaks navigation). */
export const shadows = {
  sm: {
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} satisfies Record<string, ViewStyle>

export const fabStyle: ViewStyle = {
  position: 'absolute',
  right: 20,
  bottom: 24,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: Colors.brand.primary,
  alignItems: 'center',
  justifyContent: 'center',
  ...shadows.lg,
}
