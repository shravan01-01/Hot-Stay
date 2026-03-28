/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/**/*.{js,ejs,html}",
    "./server/**/*.{js,ejs,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F7A8C',
        secondary: '#E07A5F',
        background: '#F4F1EE',
        accent: '#81B29A',
        dark: '#2F3E46',
        text: '#1A1A1A',
      },
      fontFamily: {
        'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}