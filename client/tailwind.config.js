/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#b8d8ff',
          300: '#8fc0ff',
          400: '#61a0ff',
          500: '#3c82f6',
          600: '#2b6ad6',
          700: '#2556ad',
          800: '#224887',
          900: '#1f3c70',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
