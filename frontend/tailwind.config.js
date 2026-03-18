/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF8F5',
          dark: '#F0EDE8',
        },
        gold: {
          DEFAULT: '#C4A265',
          light: '#D4B87A',
          border: '#C4A265',
          italic: '#C9A96E',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
        },
        'nav-active': '#F5F0E8',
        'grey-bg': '#F5F3F0',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'hero': ['48px', { lineHeight: '56px' }],
        'h1': ['36px', { lineHeight: '44px' }],
        'h2': ['28px', { lineHeight: '36px' }],
        'h3': ['20px', { lineHeight: '28px' }],
        'overline': ['12px', { lineHeight: '16px', letterSpacing: '0.15em' }],
      },
      borderRadius: {
        'pill': '9999px',
      },
      maxWidth: {
        'content': '1200px',
        'form': '480px',
        'onboarding': '560px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
