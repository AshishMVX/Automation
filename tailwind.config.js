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
          DEFAULT: '#534AB7',
          50: '#f0effc',
          100: '#e0ddf9',
          200: '#c1bbf3',
          300: '#a299ec',
          400: '#8377e6',
          500: '#534AB7',
          600: '#4840a5',
          700: '#3d3793',
          800: '#322e81',
          900: '#27256f',
        }
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(110%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in':  'fadeIn 0.25s ease-out',
      }
    },
  },
  plugins: [],
}
