'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { ventures } from '@/lib/ventures';

const FD = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
});

export default function CompanyHero() {
  const scrollToMap = () => {
    document.getElementById('venture-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none dot-grid"
        style={{
          maskImage: 'radial-gradient(ellipse 100% 90% at 50% 50%, black 35%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 90% at 50% 50%, black 35%, transparent 100%)',
        }}
      />
      {/* Aurora glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 42% at 28% 8%, rgba(139,92,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 55% 40% at 75% 16%, rgba(6,182,212,0.05) 0%, transparent 60%), radial-gradient(ellipse 75% 45% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10 pt-32 pb-20">
        {/* Eyebrow */}
        <motion.div {...FD(0.08)} className="flex items-center gap-3 mb-10">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full animate-glow-pulse"
              style={{ width: '5px', height: '5px', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.8)' }}
            />
          </span>
          <p className="t-eyebrow" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Construx Group · Five ventures, all live
          </p>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...FD(0.2)} className="t-hero mb-9" style={{ maxWidth: '13ch' }}>
          We build what
          <br />
          only AI makes
          <br />
          <span
            style={{
              background: 'linear-gradient(100deg, #ffffff 10%, rgba(139,92,246,0.95) 55%, rgba(6,182,212,0.9) 95%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            possible.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p {...FD(0.34)} className="t-lead max-w-xl mb-11">
          Five AI-native ventures at the frontier of what today&apos;s models make
          buildable. No retrofits. No templates. Each one designed from first
          principles around what AI enables.
        </motion.p>

        {/* CTAs */}
        <motion.div {...FD(0.46)} className="flex flex-wrap items-center gap-5 mb-16">
          <button onClick={scrollToMap} className="btn-primary" style={{ cursor: 'pointer' }}>
            Explore the ventures
            <ArrowDown size={14} />
          </button>
          <a href="/work-with-us" className="btn-text">
            Work with us <ArrowRight size={13} />
          </a>
        </motion.div>

        {/* Venture strip */}
        <motion.div {...FD(0.58)}>
          <div
            className="flex flex-wrap items-stretch rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
          >
            {ventures.map((v, i) => (
              <a
                key={v.slug}
                href={`/ventures/${v.slug}`}
                className="group relative flex-1 min-w-[160px] px-5 py-5 transition-colors duration-200 hover:bg-white/[0.03]"
                style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: v.accent, boxShadow: `0 0 7px ${v.accent}` }}
                  />
                  <span className="t-meta" style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.28)' }}>
                    {v.category}
                  </span>
                </div>
                <p
                  className="font-display text-[15px] text-white/75 group-hover:text-white transition-colors"
                  style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
                >
                  {v.name}
                </p>
                {/* hover accent line */}
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: `linear-gradient(90deg, transparent, ${v.accent}, transparent)` }}
                />
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={scrollToMap}
        aria-label="Scroll to venture map"
      >
        <span className="t-meta" style={{ fontSize: 8 }}>Venture map</span>
        <div className="w-px h-9 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.button>
    </section>
  );
}
