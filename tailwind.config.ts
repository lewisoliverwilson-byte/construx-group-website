import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#000008',
        'void-mid': '#05050F',
        construx: '#F97316',
        'construx-dim': 'rgba(249,115,22,0.12)',
        'construx-glow': 'rgba(249,115,22,0.35)',
        'text-base': '#F0EFFF',
        'text-muted': 'rgba(240,239,255,0.48)',
        'text-dim': 'rgba(240,239,255,0.22)',
        border: 'rgba(255,255,255,0.07)',
        'border-bright': 'rgba(255,255,255,0.14)',
        glass: 'rgba(5,5,18,0.88)',
        venture: {
          scoutr: '#C8F50C',
          marqet: '#3B82F6',
          hyve: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        display: ['clamp(3.2rem,8vw,7.5rem)', { lineHeight: '0.92', letterSpacing: '-0.035em' }],
        'display-sm': ['clamp(2rem,5vw,4.2rem)', { lineHeight: '0.96', letterSpacing: '-0.03em' }],
        'heading-xl': ['clamp(1.5rem,3vw,2.6rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'heading-lg': ['clamp(1.2rem,2vw,1.8rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
      animation: {
        'glow-pulse': 'glowPulse 3.5s ease-in-out infinite',
        'corona': 'corona 4s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'slide-right': 'slideRight 0.45s cubic-bezier(0.16,1,0.3,1)',
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scan': 'scan 5s linear infinite',
        'orbit': 'orbit var(--orbit-duration,20s) linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%,100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        corona: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.18)', opacity: '0.6' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        slideRight: {
          from: { transform: 'translateX(110%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'grid-orange':
          'linear-gradient(rgba(249,115,22,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.025) 1px,transparent 1px)',
        'radial-orange':
          'radial-gradient(ellipse 80% 50% at 50% -10%,rgba(249,115,22,0.12),transparent)',
        'radial-center':
          'radial-gradient(ellipse 60% 60% at 50% 50%,rgba(249,115,22,0.06),transparent)',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
      boxShadow: {
        'glow-orange': '0 0 40px rgba(249,115,22,0.28),0 0 80px rgba(249,115,22,0.12)',
        'glow-sm': '0 0 16px rgba(249,115,22,0.22)',
        glass: '0 8px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-hover': '0 16px 48px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.1)',
        venture: '0 0 30px var(--venture-glow)',
      },
    },
  },
  plugins: [],
};

export default config;
