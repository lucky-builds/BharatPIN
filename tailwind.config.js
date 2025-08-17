/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        white: '#FFFFFF',
        green: '#138808',
        navy: '#000080',
      }
    },
  },
  plugins: [],
}