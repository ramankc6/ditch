/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        'text': '#fdfdfd',
        'primary': '#040a30',
        'background': '#fcb711',
        'secondary': '#ef9952',
        'accent': '#ef9952',
        'light-blue': '#2acdff',
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