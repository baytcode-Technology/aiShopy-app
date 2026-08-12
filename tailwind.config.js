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
          DEFAULT: 'var(--color-ink)',
          overlay: 'var(--color-ink-overlay)',
          soft: 'var(--color-ink-soft)',
          counter: 'var(--color-ink-counter)',
        },
        charcoal: 'var(--color-charcoal)',
        surface: 'var(--color-surface)',
        gray: {
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
        },
        success: 'var(--color-success)',
        'success-bg': 'var(--color-success-bg)',
        'success-border': 'var(--color-success-border)',
        danger: 'var(--color-danger)',
        'danger-bg': 'var(--color-danger-bg)',
        'danger-border': 'var(--color-danger-border)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        brand: {
          primary: 'var(--color-brand-primary)',
          green: 'var(--color-brand-green)',
          'on-primary': 'var(--color-brand-on-primary)',
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
