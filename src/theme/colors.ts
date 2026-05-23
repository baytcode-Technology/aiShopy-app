import { palette } from './palette'

/**
 * Semantic color tokens — use these in components (icons, ActivityIndicator, etc.).
 * For layout/spacing, prefer Tailwind classes mapped in tailwind.config.js.
 */
export const Colors = {
  brand: {
    primary: palette.ink,
    onPrimary: palette.surface,
  },
  text: {
    primary: palette.ink,
    secondary: palette.gray600,
    muted: palette.gray400,
    inverse: palette.surface,
    danger: palette.danger,
    success: palette.success,
    warning: palette.warning,
  },
  bg: {
    primary: palette.surface,
    secondary: palette.gray100,
    inverse: palette.ink,
    success: palette.successBg,
    danger: palette.dangerBg,
    warning: palette.warningBg,
  },
  border: {
    default: palette.gray200,
    strong: palette.ink,
    danger: palette.danger,
    success: palette.successBorder,
  },
  status: {
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
  },
  overlay: palette.overlay,
} as const

/** @deprecated Use Colors or Tailwind classes. Kept for gradual migration. */
export const theme = {
  black: palette.ink,
  white: palette.surface,
  gray100: palette.gray100,
  gray200: palette.gray200,
  gray400: palette.gray400,
  gray600: palette.gray600,
  border: palette.gray200,
  success: palette.success,
  successBg: palette.successBg,
  successBorder: palette.successBorder,
  danger: palette.danger,
  warning: palette.warning,
} as const

export default Colors
