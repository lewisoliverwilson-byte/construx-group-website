'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { ventures } from '@/lib/ventures';

const FD = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
});

export default function CompanyHero() {
  const scrollToMap = () => {
    document.getElementById('venture-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
          maskImage: 'radial-gradient(ellipse 100% 90% at 50% 50%, black 40%, transparent 100%)',
        }}
      />
      {/* Top glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 45% at 50% 0%, rgba(255,255,255,0.032) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-12 pt-32 pb-24">
        {/* Eyebrow */}
        <motion.p
          {...FD(0.1)}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/28 mb-8"
        >
          Construx Group&nbsp;&nbsp;·&nbsp;&nbsp;AI-native ventures
        </motion.p>

        {/* Headline */}
        <motion.h1
          {...FD(0.22)}
          className="text-white/95 leading-[0.9] mb-8"
          style={{
            fontFamily: 'Clash Display, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(3.4rem, 8vw, 8rem)',
            letterSpacing: '-0.035em',
          }}
        >
          We build what<br />
          only AI makes<br />
          possible.
        </motion.h1>

        {/* Description */}
        <motion.p
          {...FD(0.35)}
          className="text-[16px] text-white/38 font-light leading-relaxed max-w-xl mb-10"
        >
          Five AI-native ventures at the frontier of what today's models make
          buildable. No retrofits. No templates. Each one designed from first
          principles around what AI enables.
        </motion.p>

        {/* Venture tags */}
        <motion.div {...FD(0.46)} className="flex flex-wrap items-center gap-2.5 mb-12">
          {ventures.map((v) => (
            <div
              key={v.slug}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
              style={{
                background: `${v.accent}12`,
                border: `1px solid ${v.accent}28`,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: v.accent, boxShadow: `0 0 6px ${v.accent}` }}
              />
              <span
                className="font-mono text-[9px] uppercase tracking-wider whitespace-nowrap"
                style={{ color: v.accent }}
              >
                {v.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div {...FD(0.55)} className="flex flex-wrap items-center gap-5">
          <button
            onClick={scrollToMap}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded text-[13px] font-light tracking-wide text-white/85 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.22)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.13)';
            }}
          >
            Explore ventures
            <ArrowDown size={13} />
          </button>
          <a
            href="/work-with-us"
            className="text-[13px] text-white/32 font-light hover:text-white/65 transition-colors tracking-wide flex items-center gap-1.5"
          >
            Work with us <ArrowRight size={12} />
          </a>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          {...FD(0.66)}
          className="flex flex-wrap items-center gap-8 mt-16 pt-8 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          {[
            { value: '5', label: 'live ventures' },
            { value: 'Claude', label: 'primary model' },
            { value: '167+', label: 'Marqet listings' },
            { value: '<5s', label: 'Scoutr scan' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span
                className="text-[18px] text-white/82"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
              >
                {value}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer"
        onClick={scrollToMap}
      >
        <span className="font-mono text-[8px] uppercase tracking-widest text-white/18">Venture map</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/15 to-transparent" />
      </motion.div>
    </section>
  );
}
