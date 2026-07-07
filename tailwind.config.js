/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Cabinet Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        glass: {
          white: 'rgba(255,255,255,0.3)',
          dark: 'rgba(15,23,42,0.6)',
        },
        accent: {
          yellow: '#F5E642',
          teal: '#7EC8B8',
          lavender: '#C3B9E8',
          warm: '#F5EFB8',
          pink: '#F5C6D0',
          wintergreen: '#A4D6C2',
          wintergreenDark: '#7CB29D',
          wintergreenLight: '#C0E9D9',
        },
        bg: {
          start: '#C0E9D9',
          mid: '#A4D6C2',
          end: '#7CB29D',
          dark: '#0F172A',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
        },
      },
      borderRadius: {
        card: '24px',
        pill: '50px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.10)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.15)',
      },
      animation: {
        'gradient-shift': 'gradientShift 20s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-record': 'pulseRecord 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseRecord: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.7' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
