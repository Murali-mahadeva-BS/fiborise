/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f7fbf6',
          100: '#e9f3e6',
          200: '#cfe3c9',
        },
        moss: {
          200: '#b7d2a8',
          600: '#3f7657',
          700: '#315c45',
          800: '#254835',
        },
        charcoal: {
          600: '#5a665e',
          700: '#37423b',
          800: '#242d28',
          900: '#18201c',
          950: '#101512',
        },
      },
    },
  },
  plugins: [],
};
