module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      phone: { max: '768px' },
      tablet: { max: '1024px' },
      md: { max: '1280px' },
      xl: { max: '1440px' }
    },
    extend: {
      width: {
        desktop: '1240px'
      }
    }
  },
  plugins: []
}
