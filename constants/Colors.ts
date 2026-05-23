/**
 * App colors + legacy Expo template shape (`light` / `dark`).
 * Prefer `@src/theme/colors` or Tailwind classes in new code.
 */
import Colors, { theme } from '@src/theme/colors'

/** Maps semantic tokens for Themed.tsx and starter screens */
const legacyThemes = {
  light: {
    text: Colors.text.primary,
    background: Colors.bg.primary,
    tint: Colors.brand.primary,
    tabIconDefault: Colors.text.muted,
    tabIconSelected: Colors.brand.primary,
  },
  dark: {
    text: Colors.text.inverse,
    background: Colors.bg.inverse,
    tint: Colors.brand.primary,
    tabIconDefault: Colors.text.muted,
    tabIconSelected: Colors.brand.primary,
  },
} as const

const AppColors = {
  ...Colors,
  light: legacyThemes.light,
  dark: legacyThemes.dark,
}

export default AppColors
export { theme, Colors }
