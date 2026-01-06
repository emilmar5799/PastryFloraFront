/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7b4ca0',
        primaryDark: '#5e357d',
        secondary: '#f3e8f9',
        background: '#faf7fc',
      },
    },
  },
  plugins: [],
}
