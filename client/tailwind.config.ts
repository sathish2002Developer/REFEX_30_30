/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          refex: {
            dark: '#FFFFFF',
            darker: '#F5F5F5',
            gold: '#C9A84C',
            'gold-light': '#D4B85E',
            surface: '#F8F9FA',
            'surface-light': '#DEE2E6',
            text: '#111827',
            'text-muted': '#4B5563',
            'text-dim': '#9CA3AF',
            accent: '#3B82F6',
          },
          navy: {
            DEFAULT: '#021B33',
            light: '#0A2540',
            card: '#1E2A38',
            surface: '#112240',
            border: '#233554',
          },
          premium: {
            gold: '#D4AF37',
            'gold-light': '#E8C96E',
            'gold-dim': '#8B7355',
            offwhite: '#F5F5F5',
            cream: '#F0E6D2',
          }
        },
        fontFamily: {
          serif: ['"Playfair Display"', 'Georgia', 'serif'],
          sans: ['"Inter"', 'system-ui', 'sans-serif'],
        },
        animation: {
          'marquee': 'marquee 25s linear infinite',
          'fade-in': 'fadeIn 0.5s ease-out',
          'slide-up': 'slideUp 0.6s ease-out',
        },
        keyframes: {
          marquee: {
            '0%': { transform: 'translateX(0%)' },
            '100%': { transform: 'translateX(-50%)' },
          },
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
      },
    },
    plugins: [],
  }