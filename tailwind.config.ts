import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#0A84FF',
          light: '#409CFF',
          dark: '#0071E3',
        },
        accent: {
          green: '#30D158',
          orange: '#FF9F0A',
          red: '#FF453A',
          purple: '#BF5AF2',
        },
        light: {
          bg: '#F5F5F7',
          surface: '#FFFFFF',
          border: '#D2D2D7',
          text: '#1D1D1F',
          muted: '#6E6E73',
        },
        dark: {
          bg: '#08090C',
          surface: '#111318',
          border: '#1E1E24',
          text: '#F5F5F7',
          muted: '#8E8E93',
        },
      },
      borderRadius: {
        ios: '12px',
        'ios-lg': '18px',
        'ios-xl': '24px',
      },
      boxShadow: {
        'ios-sm': '0 2px 8px rgba(0,0,0,0.10)',
        'ios-md': '0 4px 20px rgba(0,0,0,0.12)',
        'ios-lg': '0 8px 40px rgba(0,0,0,0.16)',
        'ios-glow': '0 0 24px rgba(10,132,255,0.30)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
