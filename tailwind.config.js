/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'Arial', 'sans-serif']
      },
      colors: {
        ink: '#1f2937',
        copper: '#b45309',
        tealish: '#0f766e'
      }
    }
  },
  plugins: []
};
