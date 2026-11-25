/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f7f7fb',
          100: '#eeeef6',
          200: '#dcdcec',
          300: '#b9b9d3',
          400: '#8c8cb0',
          500: '#64648c',
          600: '#4a4a6e',
          700: '#35354f',
          800: '#23233a',
          900: '#14141f',
        },
        brand: {
          50: '#f1f0ff',
          100: '#e4e2ff',
          200: '#cbc6ff',
          300: '#a89fff',
          400: '#8576fb',
          500: '#6d57f5',
          600: '#5b3de8',
          700: '#4c2fcc',
          800: '#3e29a4',
          900: '#33257f',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,20,31,0.04), 0 8px 24px -8px rgba(20,20,31,0.10)',
        lift: '0 2px 4px rgba(20,20,31,0.05), 0 24px 48px -16px rgba(60,40,160,0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'pop-in': 'pop-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}
