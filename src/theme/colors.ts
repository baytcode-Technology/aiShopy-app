import { palette } from './palette'

export const Colors = {
  brand: {
    primary: palette.ink,
    green: palette.brandGreen,
    onPrimary: palette.surface,
  },
  text: {
    primary: palette.ink,
    secondary: palette.gray600,
    muted: palette.gray400,
    inverse: palette.surface,
    danger: palette.ink,
    success: palette.ink,
    warning: palette.gray600,
  },
  bg: {
    primary: palette.surface,
    secondary: palette.gray100,
    muted: palette.gray50,
    inverse: palette.ink,
    success: palette.successBg,
    danger: palette.dangerBg,
    warning: palette.warningBg,
  },
  border: {
    default: palette.gray200,
    strong: palette.ink,
    danger: palette.gray300,
    success: palette.successBorder,
  },
  status: {
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
  },
  overlay: palette.overlay,
} as const

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
