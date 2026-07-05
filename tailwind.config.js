/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 👈 LA LIGNE MAGIQUE EST ICI
  theme: {
    extend: {
      colors: {
        flashkin: {
          blue: '#24445c',
          yellow: '#f4c414',
          light: '#f8f9fa',
          dark: '#333333'
        }
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'fadeInDown': 'fadeInDown 0.6s ease-out forwards',
        'float-3d': 'float-3d 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'float-3d': {
          '0%, 100%': {
            transform: 'translateY(0px) rotateX(0deg)'
          },
          '50%': {
            transform: 'translateY(-10px) rotateX(5deg)'
          }
        }
      }
    },
  },
  plugins: [],
}