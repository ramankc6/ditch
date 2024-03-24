/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        'primary': '#2D87C6',
        'background': '#FFF8E7',
        'secondary': '#001F3F',
        'accent': '#fcb711',
        'tertiary': '#F7931B',
       },       
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
      },
      screens: {
        xs: "450px",
      },

    },
  },
  plugins: [],
};