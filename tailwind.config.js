const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
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
      },
      fontFamily: {
        sans: ['Red Hat Display', 'Roboto', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        unlocGray: {
          100: '#94a3b8',
          200: '#64748b',
          300: '#334155',
          500: '#1e293b',
          900: '#0f172a'
        },
        unlocPink: '#e0097e'
      }
    }
  },
  // plugins: [require('@tailwindcss/forms')]
}
