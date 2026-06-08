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
        'text-base': 'rgba(255,255,255,0.92)',
        'text-muted': 'rgba(255,255,255,0.45)',
        'text-dim': 'rgba(255,255,255,0.22)',
        border: 'rgba(255,255,255,0.07)',
        'border-bright': 'rgba(255,255,255,0.14)',
        glass: 'rgba(0,0,12,0.72)',
        subtle: 'rgba(255,255,255,0.04)',
        venture: {
          scoutr: '#C8F50C',
          marqet: '#3B82F6',
          hyve: '#8B5CF6',
          daily: '#F59E0B',
          studio: '#06B6D4',
        },
      },
      fontFamily: {
        display: ['Clash Display', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        display: ['clamp(3.2rem,8vw,7.5rem)', { lineHeight: '0.90', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(2rem,5vw,4.2rem)', { lineHeight: '0.94', letterSpacing: '-0.025em' }],
        'heading-xl': ['clamp(1.5rem,3vw,2.6rem)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
        'heading-lg': ['clamp(1.2rem,2vw,1.8rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
      },
      animation: {
        'glow-pulse': 'glowPulse 3.5s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.45s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        marquee: 'marquee 55s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          from: { transform: 'translateY(22px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
        'radial-void':
          'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(139,92,246,0.08),transparent)',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-hover': '0 16px 48px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.1)',
        venture: '0 0 30px var(--venture-glow)',
      },
    },
  },
  plugins: [],
};

export default config;
