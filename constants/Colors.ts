/**
 * App colors + legacy Expo template shape (`light` / `dark`).
 * Prefer `@src/theme/colors` or Tailwind classes in new code.
 */
import Colors, { getColors, theme } from '@src/theme/colors'

function buildLegacyThemes() {
  const c = getColors()
  return {
    light: {
      text: c.text.primary,
      background: c.bg.primary,
      tint: c.brand.primary,
      tabIconDefault: c.text.muted,
      tabIconSelected: c.brand.primary,
    },
    dark: {
      text: c.text.inverse,
      background: c.bg.inverse,
      tint: c.brand.primary,
      tabIconDefault: c.text.muted,
      tabIconSelected: c.brand.primary,
    },
  } as const
}

const AppColors = {
  ...Colors,
  get light() {
    return buildLegacyThemes().light
  },
  get dark() {
    return buildLegacyThemes().dark
  },
}

export default AppColors
export { theme, Colors }
