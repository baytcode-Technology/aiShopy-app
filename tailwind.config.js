const palette = require('./src/theme/palette.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: palette.ink,
          overlay: palette.overlay,
          soft: palette.inkSoft,
          counter: palette.inkCounter,
        },
        surface: palette.surface,
        gray: {
          100: palette.gray100,
          200: palette.gray200,
          400: palette.gray400,
          600: palette.gray600,
        },
        success: palette.success,
        'success-bg': palette.successBg,
        'success-border': palette.successBorder,
        danger: palette.danger,
        'danger-bg': palette.dangerBg,
        warning: palette.warning,
        'warning-bg': palette.warningBg,
        brand: {
          primary: palette.ink,
          'on-primary': palette.surface,
        },
      },
      borderRadius: {
        '4xl': '24px',
        '5xl': '28px',
      },
    },
  },
  plugins: [],
}
