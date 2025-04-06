/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4285f4',
          dark: '#3367d6',
        },
        background: {
          DEFAULT: '#25292e',
          light: '#2f343a',
        },
        text: {
          DEFAULT: '#ffffff',
          secondary: '#a0a0a0',
        },
      },
    },
  },
  plugins: [],
};