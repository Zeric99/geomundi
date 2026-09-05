/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#121214',
          surface: '#18181B',
          card: '#202024',
          cardHover: '#27272A',
          elevated: '#2D2D32',
          border: '#3F3F46'
        },
        brand: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          accent: '#6366F1',
        },
        geo: {
          neutral: '#27272A',
          neutralBorder: '#3F3F46',
          hover: '#4F46E5',
          selected: '#6366F1',
          correct: '#059669',
          correctBorder: '#10B981',
          wrong: '#E11D48',
          wrongBorder: '#F43F5E',
          hint: '#D97706',
          targetPulse: '#4F46E5',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        title: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['Outfit', 'Plus Jakarta Sans', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glow-emerald': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glow-purple': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glow-amber': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glow-rose': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glass': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'card-subtle': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          'from': { backgroundPosition: '200% 0' },
          'to': { backgroundPosition: '-200% 0' }
        }
      }
    },
  },
  plugins: [],
}
