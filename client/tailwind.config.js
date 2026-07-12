/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a3ff',
          500: '#5275ff',
          600: '#3350eb',
          700: '#263ac7',
          800: '#202fa1',
          900: '#1e2b82',
        },
        dark: {
          bg: '#080b11',
          card: 'rgba(15, 22, 36, 0.6)',
          border: 'rgba(255, 255, 255, 0.07)',
          text: '#f3f4f6',
          muted: '#9ca3af',
        }
      },
    },
  },
  plugins: [],
}
