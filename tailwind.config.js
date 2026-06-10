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
        charcoal: palette.charcoal,
        surface: palette.surface,
        gray: {
          50: palette.gray50,
          100: palette.gray100,
          200: palette.gray200,
          300: palette.gray300,
          400: palette.gray400,
          500: palette.gray500,
          600: palette.gray600,
          700: palette.gray700,
        },
        success: palette.success,
        'success-bg': palette.successBg,
        'success-border': palette.successBorder,
        danger: palette.danger,
        'danger-bg': palette.dangerBg,
        'danger-border': palette.dangerBorder,
        warning: palette.warning,
        'warning-bg': palette.warningBg,
        brand: {
          primary: palette.ink,
          green: palette.brandGreen,
          'on-primary': palette.surface,
        },
      },
      borderRadius: {
        '4xl': '28px',
        '5xl': '32px',
      },
      letterSpacing: {
        brand: '0.35em',
      },
    },
  },
  plugins: [],
}
