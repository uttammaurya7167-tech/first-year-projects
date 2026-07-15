/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space': {
          950: '#000308',
          900: '#000a1a',
          800: '#001429',
          700: '#001e3d',
          600: '#002952',
        },
        'cyan': {
          400: '#22d3ee',
          500: '#06b6d4',
          glow: '#00ffff',
        },
        'bio': {
          green: '#39ff14',
          teal: '#00ffa3',
          purple: '#bf5af2',
          amber: '#ffa500',
        },
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'dome-gradient': 'radial-gradient(ellipse at center, #001e3d 0%, #000a1a 60%, #000308 100%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(0,255,255,0.15) 0%, transparent 70%)',
        'glow-green': 'radial-gradient(ellipse at center, rgba(57,255,20,0.1) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drift': 'drift 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'scan': 'scan 6s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10px, -15px) rotate(5deg)' },
          '50%': { transform: 'translate(-8px, -8px) rotate(-3deg)' },
          '75%': { transform: 'translate(12px, 5px) rotate(7deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,255,255,0.3), 0 0 20px rgba(0,255,255,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0,255,255,0.6), 0 0 60px rgba(0,255,255,0.2)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,255,255,0.4), 0 0 60px rgba(0,255,255,0.1)',
        'glow-green': '0 0 20px rgba(57,255,20,0.4), 0 0 60px rgba(57,255,20,0.1)',
        'glow-purple': '0 0 20px rgba(191,90,242,0.4), 0 0 60px rgba(191,90,242,0.1)',
        'inner-glow': 'inset 0 0 30px rgba(0,255,255,0.05)',
        'panel': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
