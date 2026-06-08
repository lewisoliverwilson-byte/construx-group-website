'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const FADE = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
});

export default function CompanyHero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Subtle top-center glow — pure CSS, no canvas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,255,255,0.028) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-12 pt-32 pb-28">
        {/* Eyebrow */}
        <motion.p
          {...FADE(0.1)}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-8"
        >
          Construx Group &nbsp;·&nbsp; AI-native ventures
        </motion.p>

        {/* Headline */}
        <motion.h1
          {...FADE(0.22)}
          className="text-white/95 leading-[0.92] mb-8"
          style={{
            fontFamily: 'Clash Display, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(3.2rem, 7.5vw, 7.5rem)',
            letterSpacing: '-0.03em',
          }}
        >
          We build what<br />
          only AI makes<br />
          possible.
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...FADE(0.36)}
          className="text-[16px] text-white/38 font-light leading-relaxed max-w-lg mb-12"
        >
          Five live ventures — each one designed around what AI enables, not what existed before. No
          templates. No retrofits. Built from first principles.
        </motion.p>

        {/* CTAs */}
        <motion.div {...FADE(0.48)} className="flex flex-wrap items-center gap-4">
          <Link
            href="#ventures"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded text-[13px] font-light tracking-wide text-white/85 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.11)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.22)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)';
            }}
          >
            Explore ventures
            <ArrowRight size={13} />
          </Link>
          <Link
            href="/work-with-us"
            className="text-[13px] text-white/35 font-light hover:text-white/65 transition-colors tracking-wide"
          >
            Work with us →
          </Link>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          {...FADE(0.6)}
          className="flex items-center gap-6 mt-16 pt-8 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {[
            { value: '5', label: 'live ventures' },
            { value: 'Claude', label: 'primary model' },
            { value: '167+', label: 'Marqet listings' },
            { value: '<5s', label: 'Scoutr scan time' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span
                className="text-[17px] text-white/82"
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
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-10 bg-gradient-to-b from-white/18 to-transparent" />
      </motion.div>
    </section>
  );
}
