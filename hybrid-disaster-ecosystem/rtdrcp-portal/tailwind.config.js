/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Command Deck Theme
        navy: {
          950: '#020B18',
          900: '#060F1F',
          800: '#0A1628',
          700: '#0F2040',
          600: '#162B55',
          500: '#1E3A6E',
        },
        charcoal: {
          900: '#0D0D0D',
          800: '#141414',
          700: '#1A1A1A',
          600: '#222222',
          500: '#2A2A2A',
        },
        alert: {
          red: '#FF1F3D',
          redDark: '#8B0000',
          redGlow: 'rgba(255, 31, 61, 0.3)',
          orange: '#FF6B2B',
          yellow: '#FFD700',
        },
        status: {
          green: '#00FF88',
          greenDark: '#006633',
          greenGlow: 'rgba(0, 255, 136, 0.3)',
          blue: '#00B4FF',
          purple: '#9B59B6',
        },
        surface: {
          primary: '#0A1628',
          secondary: '#0F2040',
          tertiary: '#162B55',
          overlay: 'rgba(10, 22, 40, 0.85)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulseRed 1.2s ease-in-out infinite',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'blink-fast': 'blink 0.6s step-end infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'glow-red': 'glowRed 1.5s ease-in-out infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px #FF1F3D, 0 0 20px #FF1F3D' },
          '50%': { opacity: '0.4', boxShadow: '0 0 2px #FF1F3D' },
        },
        pulseGreen: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px #00FF88, 0 0 20px #00FF88' },
          '50%': { opacity: '0.6', boxShadow: '0 0 2px #00FF88' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glowRed: {
          '0%, 100%': { textShadow: '0 0 10px #FF1F3D, 0 0 20px #FF1F3D' },
          '50%': { textShadow: '0 0 2px #FF1F3D' },
        },
        scanLine: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
