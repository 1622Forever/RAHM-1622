/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF7',
          100: '#FDFBF7',
          200: '#F5F2E9',
          300: '#E6E1D3',
        },
        leaf: {
          900: '#042F2E',
          800: '#065F46',
          700: '#047857',
          600: '#059669',
          500: '#10B981',
          400: '#34D399',
          300: '#6EE7B7',
        },
        primary: {
          500: '#059669',
          400: '#10B981',
          600: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'leaf-glow': '0 0 25px -3px rgba(16, 185, 129, 0.4)',
        'cream-card': '0 10px 30px rgba(4, 47, 46, 0.1)',
      }
    },
  },
  plugins: [],
}
