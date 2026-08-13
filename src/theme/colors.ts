import {
  darkPalette,
  getPaletteForMode,
  lightPalette,
  type Palette,
  type ThemeMode,
} from './palette'

export type { Palette, ThemeMode }

export type AppColors = {
  brand: {
    primary: string
    green: string
    onPrimary: string
  }
  text: {
    primary: string
    secondary: string
    muted: string
    inverse: string
    danger: string
    success: string
    warning: string
  }
  bg: {
    primary: string
    secondary: string
    muted: string
    inverse: string
    success: string
    danger: string
    warning: string
  }
  border: {
    default: string
    strong: string
    danger: string
    success: string
  }
  status: {
    success: string
    danger: string
    warning: string
  }
  overlay: string
}

export function createColors(p: Palette): AppColors {
  return {
    brand: {
      primary: p.ink,
      green: p.brandGreen,
      onPrimary: p.surface,
    },
    text: {
      primary: p.ink,
      secondary: p.gray600,
      muted: p.gray400,
      inverse: p.surface,
      danger: p.ink,
      success: p.ink,
      warning: p.gray600,
    },
    bg: {
      primary: p.surface,
      secondary: p.gray100,
      muted: p.gray50,
      inverse: p.ink,
      success: p.successBg,
      danger: p.dangerBg,
      warning: p.warningBg,
    },
    border: {
      default: p.gray200,
      strong: p.ink,
      danger: p.gray300,
      success: p.successBorder,
    },
    status: {
      success: p.success,
      danger: p.danger,
      warning: p.warning,
    },
    overlay: p.overlay,
  }
}

export function createThemeFlat(p: Palette) {
  return {
    black: p.ink,
    white: p.surface,
    gray100: p.gray100,
    gray200: p.gray200,
    gray400: p.gray400,
    gray600: p.gray600,
    border: p.gray200,
    success: p.success,
    successBg: p.successBg,
    successBorder: p.successBorder,
    danger: p.danger,
    warning: p.warning,
  }
}

let activePalette: Palette = lightPalette
let activeColors = createColors(lightPalette)
let activeThemeFlat = createThemeFlat(lightPalette)

export function getActivePalette(): Palette {
  return activePalette
}

export function getColors(): AppColors {
  return activeColors
}

export function getThemeFlat() {
  return activeThemeFlat
}

export function setActiveThemeMode(mode: ThemeMode): AppColors {
  activePalette = getPaletteForMode(mode)
  activeColors = createColors(activePalette)
  activeThemeFlat = createThemeFlat(activePalette)
  return activeColors
}

/** Backward-compatible default export — reads live active colors. */
const ColorsProxy = new Proxy({} as AppColors, {
  get(_target, prop: keyof AppColors) {
    return activeColors[prop]
  },
})

export default ColorsProxy

/** @deprecated Prefer getThemeFlat() for theme-aware reads. */
export const theme = createThemeFlat(lightPalette)

export const Colors = ColorsProxy
