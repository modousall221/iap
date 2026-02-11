/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from Predika logo
        primary: '#14b8a6', // turquoise Predika
        'primary-dark': '#0f766e',
        secondary: '#1e4e63', // bleu foncé logo
        brand: '#13b6a6',
        'brand-dark': '#0f5f61',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#0ea5e9',
        light: '#f3f4f6',
        dark: '#1f2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
