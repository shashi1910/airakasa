/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef9e7',
          100: '#fef3cf',
          200: '#fde7a0',
          300: '#fcdb70',
          400: '#fbcf40',
          500: '#e4c41b', // Main golden yellow
          600: '#b89d16',
          700: '#8c7611',
          800: '#604f0b',
          900: '#342806',
        },
        cream: {
          50: '#fefbf0',
          100: '#fdf7e1',
          200: '#fbefc3',
          300: '#f9e7a5',
          400: '#f7df87',
          500: '#f0e088', // Light cream
          600: '#c0b46d',
          700: '#908752',
          800: '#605a36',
          900: '#302d1b',
        },
        forest: {
          50: '#f0f5ed',
          100: '#e1ebdb',
          200: '#c3d7b7',
          300: '#a5c393',
          400: '#87af6f',
          500: '#3f6121', // Dark green
          600: '#324e1a',
          700: '#263b14',
          800: '#19270d',
          900: '#0d1407',
        },
        teal: {
          50: '#eef5f5',
          100: '#ddebec',
          200: '#bbd7d9',
          300: '#99c3c6',
          400: '#77afb3',
          500: '#62a3a4', // Teal
          600: '#4e8283',
          700: '#3b6262',
          800: '#274142',
          900: '#142121',
        },
        sage: {
          50: '#f5f7f3',
          100: '#ebefe7',
          200: '#d7dfcf',
          300: '#c3cfb7',
          400: '#afbf9f',
          500: '#a4bc94', // Sage green
          600: '#839676',
          700: '#627158',
          800: '#424b3b',
          900: '#21261d',
        },
        slate: {
          50: '#f0f2f4',
          100: '#e1e5e9',
          200: '#c3cbd3',
          300: '#a5b1bd',
          400: '#8797a7',
          500: '#334c5a', // Dark blue-gray
          600: '#293d48',
          700: '#1f2e36',
          800: '#151f24',
          900: '#0a0f12',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}