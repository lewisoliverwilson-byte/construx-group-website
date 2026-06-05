'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { ventures } from '@/lib/ventures';

function VentureCard({ venture, index }: { venture: (typeof ventures)[0]; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden"
      style={{
        background: 'rgba(5,5,18,0.88)',
        border: `1px solid ${venture.accent}22`,
        boxShadow: `0 0 40px ${venture.accent}10`,
        borderRadius: '3px',
      }}
    >
      {/* Accent stripe */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${venture.accent}, transparent)` }}
      />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="h-12 w-12 rounded-full flex-shrink-0"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${venture.accent}dd, ${venture.accent}44)`,
              boxShadow: `0 0 24px ${venture.accent}55`,
            }}
          />
          <div>
            <h3 className="text-lg font-bold text-text-base">{venture.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={venture.status} />
              <span
                className="font-mono text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5"
                style={{ color: venture.accent, background: `${venture.accent}14`, border: `1px solid ${venture.accent}20`, borderRadius: '2px' }}
              >
                {venture.category}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold mb-2" style={{ color: venture.accent }}>
          {venture.tagline}
        </p>
        <p className="text-sm text-text-muted leading-relaxed mb-5">
          {venture.pitch}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          {venture.url ? (
            <a
              href={venture.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-semibold text-black transition-all hover:scale-[1.02] uppercase tracking-wider"
              style={{ backgroundColor: venture.accent, boxShadow: `0 0 16px ${venture.accent}44`, borderRadius: '3px' }}
            >
              Visit Site <ArrowUpRight size={14} />
            </a>
          ) : null}
          <Link
            href={`/ventures/${venture.slug}`}
            className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-medium text-text-muted border border-border hover:border-border-bright hover:text-text-base transition-all uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            Full Details
          </Link>
          {venture.journalSlugs && venture.journalSlugs[0] && (
            <Link
              href={`/journal/${venture.journalSlugs[0]}`}
              className="flex items-center gap-1 font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest"
            >
              <BookOpen size={11} />
              Build log
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function MobilePlanets() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const sunY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <div ref={containerRef} className="min-h-screen w-full px-5 py-24">
      {/* Glowing sun orb at top */}
      <motion.div style={{ y: sunY }} className="flex justify-center mb-16">
        <div className="relative">
          <div
            className="h-28 w-28 rounded-full animate-glow-pulse"
            style={{
              background: 'radial-gradient(circle at 38% 38%, #FB923C, #F97316 50%, #C2410C)',
              boxShadow: '0 0 60px rgba(249,115,22,0.6), 0 0 120px rgba(249,115,22,0.3)',
            }}
          />
          {/* Corona rings */}
          {[1.6, 2.2, 3.0].map((scale, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-construx/20 animate-corona"
              style={{
                transform: `scale(${scale})`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
          <p className="text-center font-mono text-[9px] text-text-dim mt-6 tracking-[0.3em] uppercase">
            CONSTRUX.GROUP
          </p>
        </div>
      </motion.div>

      {/* Orbital line */}
      <div className="relative flex justify-center mb-12">
        <div className="w-px h-16 bg-gradient-to-b from-construx/40 to-transparent" />
      </div>

      {/* Venture cards */}
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        {ventures.map((venture, i) => (
          <VentureCard key={venture.id} venture={venture} index={i} />
        ))}
        {/* Coming soon teaser */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative overflow-hidden border border-border px-6 py-5"
          style={{ background: 'rgba(5,5,18,0.5)', borderRadius: '3px' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0.6, 0.4, 0.25].map((opacity, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ background: `rgba(255,255,255,${opacity * 0.12})` }}
                />
              ))}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">More in incubation</p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim opacity-60 mt-0.5">Orbiting into view</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
