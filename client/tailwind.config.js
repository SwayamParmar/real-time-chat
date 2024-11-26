/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{html,js,jsx,tsx}"],
  theme: {
    extend: {
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke, box-shadow',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },
  variants: {
    transitionProperty: ['responsive', 'motion-safe', 'motion-reduce']
  },
  plugins: [],
}