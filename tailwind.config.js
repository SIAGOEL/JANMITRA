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
          DEFAULT: '#346545',
          dark: '#2e5b3e',
        },
        surface: '#f9fafb',
      },
    },
  },
  plugins: [],
}
