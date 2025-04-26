module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00c6ff',
          dark: '#0072ff',
        },
        bgDark: '#0f0f23',
      },
      backgroundColor: {
        'white-005': 'rgba(255, 255, 255, 0.05)',
        'white-002': 'rgba(255, 255, 255, 0.02)',
      },
      borderColor: {
        'white-01': 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}