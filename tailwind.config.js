const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './views/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        phone: { max: '768px' },
      },
      width: {
        desktop: '1240px'
      },
      fontFamily: {
        sans: ['Red Hat Display', 'Roboto', ...defaultTheme.fontFamily.sans]
      },
      backgroundImage: {
        'unlocSave': 'url(/images/icon-save.png)',
        'unlocCancel': 'url(/images/icon-cancel.png)',
        'unlocClose': 'url(/images/icon-close.png)',
      }
    }
  },
  // plugins: [require('@tailwindcss/forms')]
}
