'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Venture } from '@/lib/ventures';

interface Props {
  venture: Venture | null;
  onClose: () => void;
}

export default function VenturePanel({ venture, onClose }: Props) {
  return (
    <AnimatePresence>
      {venture && (
        <>
          {/* Backdrop (mobile only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 sm:hidden"
            onClick={onClose}
          />

          <motion.aside
            key={venture.id}
            initial={{ x: '110%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '110%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="fixed right-4 top-20 bottom-4 z-40 w-full max-w-sm overflow-hidden flex flex-col"
            style={{
              background: 'rgba(3,3,14,0.96)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: `1px solid ${venture.accent}22`,
              borderRadius: '4px',
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${venture.accent}14, 0 24px 64px rgba(0,0,0,0.7)`,
            }}
            role="complementary"
            aria-label={`${venture.name} details`}
          >
            {/* Accent top bar */}
            <div
              className="h-px w-full flex-shrink-0"
              style={{
                background: `linear-gradient(90deg, transparent, ${venture.accent}, transparent)`,
              }}
            />

            {/* Terminal breadcrumb bar */}
            <div
              className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
                  <span className="text-construx">// </span>
                  CONSTRUX.SYS &rsaquo; {venture.name.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    backgroundColor: venture.accent,
                    display: 'inline-block',
                    boxShadow: `0 0 5px ${venture.accent}`,
                  }} />
                  <span style={{ color: venture.accent }}>
                    {venture.status === 'live' ? 'LIVE' : 'PENDING'}
                  </span>
                </span>
                <button
                  onClick={onClose}
                  className="h-6 w-6 flex items-center justify-center text-text-dim hover:text-text-base transition-colors font-mono text-xs"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px' }}
                  aria-label="Close panel"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 px-5 pt-4 pb-3">
              {/* Planet orb */}
              <div
                className="h-9 w-9 rounded-full flex-shrink-0 mt-0.5"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${venture.accent}cc, ${venture.accent}44)`,
                  boxShadow: `0 0 20px ${venture.accent}55`,
                }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-text-base leading-tight truncate">
                  {venture.name}
                </h2>
                <span
                  className="inline-block mt-1 font-mono text-[9px] font-medium uppercase tracking-widest px-1.5 py-0.5"
                  style={{
                    color: venture.accent,
                    background: `${venture.accent}10`,
                    border: `1px solid ${venture.accent}22`,
                    borderRadius: '2px',
                  }}
                >
                  {venture.category}
                </span>
              </div>
            </div>

            {/* Tagline */}
            <p
              className="px-5 pb-4 text-sm font-semibold leading-snug"
              style={{ color: venture.accent }}
            >
              {venture.tagline}
            </p>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-4 scrollbar-thin">

              {/* Pitch */}
              <p className="text-sm text-text-muted leading-relaxed">
                {venture.pitch}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {venture.stats.map((s) => (
                  <div
                    key={s.label}
                    className="px-3 py-2.5 flex flex-col gap-0.5"
                    style={{
                      background: `${venture.accent}08`,
                      border: `1px solid ${venture.accent}18`,
                      borderRadius: '2px',
                    }}
                  >
                    <span
                      className="font-mono text-sm font-semibold leading-tight tabular-nums"
                      style={{ color: venture.accent }}
                    >
                      {s.value}
                    </span>
                    <span className="font-mono text-[9px] text-text-dim uppercase tracking-wider">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

              {/* What it is */}
              <div>
                <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-text-dim mb-2">
                  // WHAT IT IS
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {venture.what}
                </p>
              </div>

              {/* Features */}
              <div>
                <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-text-dim mb-2.5">
                  // KEY CAPABILITIES
                </p>
                <ul className="space-y-1.5">
                  {venture.features.map((f, i) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="font-mono text-[9px] flex-shrink-0 mt-px" style={{ color: venture.accent }}>
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span className="text-xs text-text-muted leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTAs */}
            <div
              className="px-5 pb-5 pt-4 flex flex-col gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              {venture.url ? (
                <a
                  href={venture.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 font-mono text-xs font-semibold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider"
                  style={{
                    backgroundColor: venture.accent,
                    borderRadius: '3px',
                    boxShadow: `0 0 20px ${venture.accent}44`,
                  }}
                >
                  VISIT SITE
                  <ArrowUpRight size={14} />
                </a>
              ) : null}
              <Link
                href={`/ventures/${venture.slug}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-mono font-medium text-text-muted uppercase tracking-wider transition-all duration-200 hover:text-text-base"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '3px',
                }}
              >
                FULL DETAILS
                <ChevronRight size={13} />
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
