'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ChevronRight, Tag } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
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
            className="fixed right-4 top-20 bottom-4 z-40 w-full max-w-sm rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(5,5,18,0.92)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: `1px solid ${venture.accent}28`,
              boxShadow: `0 0 60px ${venture.accent}18, 0 24px 64px rgba(0,0,0,0.6)`,
            }}
            role="complementary"
            aria-label={`${venture.name} details`}
          >
            {/* Accent top bar */}
            <div
              className="h-1 w-full flex-shrink-0"
              style={{
                background: `linear-gradient(90deg, ${venture.accent}00, ${venture.accent}, ${venture.accent}00)`,
              }}
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Planet orb */}
                <div
                  className="h-9 w-9 rounded-full flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${venture.accent}cc, ${venture.accent}44)`,
                    boxShadow: `0 0 20px ${venture.accent}55`,
                  }}
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-text-base leading-tight truncate">
                    {venture.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={venture.status} />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{ color: venture.accent, background: `${venture.accent}14` }}
                    >
                      {venture.category}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-text-dim hover:text-text-base hover:bg-subtle transition-all"
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tagline */}
            <p
              className="px-6 pb-4 text-sm font-semibold leading-snug"
              style={{ color: venture.accent }}
            >
              {venture.tagline}
            </p>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-5 scrollbar-thin">

              {/* Pitch */}
              <p className="text-sm text-text-muted leading-relaxed">
                {venture.pitch}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2">
                {venture.stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                    style={{
                      background: `${venture.accent}0C`,
                      border: `1px solid ${venture.accent}1A`,
                    }}
                  >
                    <span
                      className="text-sm font-bold leading-tight"
                      style={{ color: venture.accent }}
                    >
                      {s.value}
                    </span>
                    <span className="text-[10px] text-text-dim uppercase tracking-wider">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* What it is */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-2">
                  What it is
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {venture.what}
                </p>
              </div>

              {/* Features */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-2.5 flex items-center gap-1.5">
                  <Tag size={10} />
                  Key capabilities
                </p>
                <ul className="space-y-1.5">
                  {venture.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: venture.accent }}
                      />
                      <span className="text-xs text-text-muted leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTAs */}
            <div className="px-6 pb-6 pt-4 flex flex-col gap-2.5 border-t border-border mt-2">
              {venture.url ? (
                <a
                  href={venture.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: venture.accent,
                    boxShadow: `0 0 20px ${venture.accent}44`,
                  }}
                >
                  Visit Site
                  <ArrowUpRight size={15} />
                </a>
              ) : null}
              <Link
                href={`/ventures/${venture.slug}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-text-muted border border-border hover:border-border-bright hover:text-text-base transition-all duration-200"
              >
                Full details
                <ChevronRight size={15} />
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
