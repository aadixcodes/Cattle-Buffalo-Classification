/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f8f3',
          100: '#dceee0',
          200: '#bcddc4',
          300: '#8fc59e',
          400: '#5da977',
          500: '#3d8b5b',
          600: '#2c6f47',
          700: '#245a3a',
          800: '#1f4830',
          900: '#193a28',
          950: '#0c2015',
        },
        earth: {
          50: '#faf7f2',
          100: '#f1ebdf',
          200: '#e2d4be',
          300: '#cab391',
          400: '#b08e64',
          500: '#9c7450',
          600: '#855d42',
          700: '#6b4a37',
          800: '#553d30',
          900: '#463329',
          950: '#271915',
        },
        cream: '#fbfaf7',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,32,24,0.04), 0 4px 16px rgba(16,32,24,0.06)',
        card: '0 1px 3px rgba(16,32,24,0.05), 0 10px 30px rgba(16,32,24,0.08)',
        glow: '0 0 0 1px rgba(45,139,91,0.18), 0 10px 40px rgba(45,139,91,0.15)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        'spin-slow': 'spin-slow 1.4s linear infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4,0,0.2,1) infinite',
      },
      backgroundImage: {
        'grid-soft':
          "linear-gradient(to right, rgba(16,32,24,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,32,24,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
