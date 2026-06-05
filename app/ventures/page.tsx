import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import StatusBadge from '@/components/ui/StatusBadge';

export const metadata: Metadata = {
  title: 'Ventures',
  description:
    'The full portfolio of Construx Group ventures — live products, coming-soon launches, and ventures in incubation.',
};

export default function VenturesPage() {
  const live = ventures.filter((v) => v.status === 'live');
  const other = ventures.filter((v) => v.status !== 'live');

  return (
    <div className="relative min-h-screen grid-bg overflow-hidden">
      <div className="absolute inset-0 bg-radial-orange pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5 text-center">
        <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4 animate-fade-in">
          // THE PORTFOLIO
        </p>
        <h1 className="text-display text-text-base mb-5 animate-fade-up"
          style={{ animationDelay: '90ms' }}>
          Our <span className="text-gradient-orange">Ventures</span>
        </h1>
        <p className="text-text-muted max-w-lg mx-auto leading-relaxed text-base animate-fade-up"
          style={{ animationDelay: '220ms' }}>
          Each venture is an independent product, built AI-first, owned by Construx Group.
          Navigate the solar system from the homepage, or read the full manifest below.
        </p>
      </section>

      {/* Stats bar */}
      <section className="relative border-y border-border py-6 px-5" style={{ background: 'rgba(3,3,14,0.7)' }}>
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            { value: String(live.length).padStart(3, '0'), label: 'Live ventures' },
            { value: '167+', label: 'Marketplace listings' },
            { value: '<5s', label: 'Avg. scan time' },
            { value: '4', label: 'Tools replaced' },
          ].map(({ value, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-construx tabular-nums">{value}</span>
              <span className="font-mono text-[9px] text-text-dim uppercase tracking-[0.18em]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Live ventures */}
      <section className="relative px-5 pt-10 pb-8 mx-auto max-w-6xl">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-6">
          // LIVE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {live.map((v) => (
            <article
              key={v.id}
              className="group relative overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.015]"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${v.accent}20`,
                boxShadow: `0 0 40px ${v.accent}08`,
                borderRadius: '3px',
              }}
            >
              {/* Top accent bar */}
              <div
                className="h-0.5 w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${v.accent}, transparent)`,
                }}
              />

              <div className="flex flex-col flex-1 p-7">
                {/* Planet + name */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="h-14 w-14 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}cc, ${v.accent}44)`,
                      boxShadow: `0 0 28px ${v.accent}44, 0 0 56px ${v.accent}18`,
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-text-base leading-tight">{v.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={v.status} />
                      <span
                        className="font-mono text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5"
                        style={{ color: v.accent, background: `${v.accent}14`, border: `1px solid ${v.accent}20`, borderRadius: '2px' }}
                      >
                        {v.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold mb-3" style={{ color: v.accent }}>
                  {v.tagline}
                </p>
                <p className="text-sm text-text-muted leading-relaxed flex-1 mb-5 line-clamp-4">
                  {v.pitch}
                </p>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {v.stats.slice(0, 4).map((s) => (
                    <div
                      key={s.label}
                      className="px-2.5 py-2"
                      style={{
                        background: `${v.accent}08`,
                        border: `1px solid ${v.accent}18`,
                        borderRadius: '2px',
                      }}
                    >
                      <p className="font-mono text-xs font-semibold tabular-nums" style={{ color: v.accent }}>{s.value}</p>
                      <p className="font-mono text-[9px] text-text-dim uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-3">
                  {v.url && (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-semibold text-black transition-all hover:scale-[1.03] uppercase tracking-wider"
                      style={{
                        backgroundColor: v.accent,
                        boxShadow: `0 0 16px ${v.accent}44`,
                        borderRadius: '3px',
                      }}
                    >
                      Visit Site <ArrowUpRight size={13} />
                    </a>
                  )}
                  <Link
                    href={`/ventures/${v.slug}`}
                    className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors"
                  >
                    Full details <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Other / coming soon */}
      {other.length > 0 && (
        <section className="relative px-5 py-8 mx-auto max-w-6xl">
          <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-6">
            // COMING SOON
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {other.map((v) => (
              <Link
                key={v.id}
                href={`/ventures/${v.slug}`}
                className="group relative overflow-hidden transition-all duration-200 hover:border-border-bright"
                style={{
                  background: 'rgba(5,5,18,0.5)',
                  border: '1px dashed rgba(255,255,255,0.08)',
                  borderRadius: '3px',
                }}
              >
                <div className="p-7 flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex-shrink-0 opacity-50 group-hover:opacity-80 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}aa, ${v.accent}33)`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-muted group-hover:text-text-base transition-colors">
                      {v.name}
                    </p>
                    <StatusBadge status={v.status} className="mt-1" />
                  </div>
                  <ChevronRight size={15} className="text-text-dim group-hover:text-text-muted transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Incubation teaser */}
      <section className="relative px-5 pb-28 mx-auto max-w-6xl">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-6">
          // IN INCUBATION
        </h2>
        <div
          className="px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{
            background: 'rgba(5,5,18,0.5)',
            border: '1px dashed rgba(255,255,255,0.07)',
            borderRadius: '3px',
          }}
        >
          <div className="flex -space-x-3">
            {[0.35, 0.25, 0.15, 0.08].map((o, i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-full border border-border"
                style={{ background: `rgba(200,180,255,${o})` }}
              />
            ))}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              More ventures in the asteroid belt.
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim opacity-60 mt-1">
              Orbiting into view when ready.
            </p>
          </div>
          <Link
            href="/journal"
            className="flex-shrink-0 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-construx hover:text-orange-400 transition-colors"
          >
            Journal <ChevronRight size={12} />
          </Link>
        </div>
      </section>
    </div>
  );
}
