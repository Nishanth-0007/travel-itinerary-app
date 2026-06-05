/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        orbitra: {
          blue:   '#2563EB',
          indigo: '#4F46E5',
          sky:    '#0EA5E9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 30px rgba(37,99,235,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        modal: '0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':     'fadeIn 0.35s ease-out',
        'fade-in-up':  'fadeInUp 0.45s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'float':       'float 3s ease-in-out infinite',
        'spin-slow':   'spinSlow 8s linear infinite',
        'shimmer':     'shimmer 1.5s infinite',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95) translateY(8px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        spinSlow:  { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      transitionDuration: { '250': '250ms' },
    },
  },
  plugins: [],
};
