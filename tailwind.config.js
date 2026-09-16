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
        cyber: {
          bg: '#06080D',
          surface: '#0B0F17',
          card: '#101623',
          cardHover: '#161F32',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(0, 240, 255, 0.3)',
          cyan: '#00F0FF',
          cyanGlow: 'rgba(0, 240, 255, 0.15)',
          emerald: '#10B981',
          emeraldGlow: 'rgba(16, 185, 129, 0.15)',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

