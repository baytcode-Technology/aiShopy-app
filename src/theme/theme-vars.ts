import type { Palette } from './palette'

/** CSS variable names consumed by Tailwind semantic color tokens. */
export function paletteToCssVars(p: Palette): Record<string, string> {
  return {
    '--color-ink': p.ink,
    '--color-ink-overlay': p.overlay,
    '--color-ink-soft': p.inkSoft,
    '--color-ink-counter': p.inkCounter,
    '--color-charcoal': p.charcoal,
    '--color-surface': p.surface,
    '--color-gray-50': p.gray50,
    '--color-gray-100': p.gray100,
    '--color-gray-200': p.gray200,
    '--color-gray-300': p.gray300,
    '--color-gray-400': p.gray400,
    '--color-gray-500': p.gray500,
    '--color-gray-600': p.gray600,
    '--color-gray-700': p.gray700,
    '--color-success': p.success,
    '--color-success-bg': p.successBg,
    '--color-success-border': p.successBorder,
    '--color-danger': p.danger,
    '--color-danger-bg': p.dangerBg,
    '--color-danger-border': p.dangerBorder,
    '--color-warning': p.warning,
    '--color-warning-bg': p.warningBg,
    '--color-brand-primary': p.ink,
    '--color-brand-green': p.brandGreen,
    '--color-brand-on-primary': p.surface,
  }
}
