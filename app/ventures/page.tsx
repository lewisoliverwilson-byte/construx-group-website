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
    <div className="min-h-screen grid-bg">
      <div className="absolute inset-0 bg-radial-orange pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5 text-center">
        <p className="text-xs font-semibold tracking-[0.28em] uppercase text-construx mb-4">
          The portfolio
        </p>
        <h1 className="text-display text-text-base mb-5">
          Our <span className="text-gradient-orange">Ventures</span>
        </h1>
        <p className="text-text-muted max-w-lg mx-auto leading-relaxed text-base">
          Each venture is an independent product, built AI-first, owned by Construx Group.
          Click any planet in the solar system or browse below.
        </p>
      </section>

      {/* Live ventures */}
      <section className="relative px-5 pb-8 mx-auto max-w-6xl">
        <h2 className="text-xs font-semibold tracking-[0.28em] uppercase text-text-dim mb-6">
          Live
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {live.map((v) => (
            <article
              key={v.id}
              className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.015]"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${v.accent}20`,
                boxShadow: `0 0 40px ${v.accent}08`,
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
                {/* Planet */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="h-14 w-14 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}cc, ${v.accent}44)`,
                      boxShadow: `0 0 28px ${v.accent}44, 0 0 56px ${v.accent}18`,
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-text-base leading-tight">{v.name}</h3>
                    <StatusBadge status={v.status} className="mt-1" />
                  </div>
                </div>

                <p
                  className="text-sm font-semibold mb-3"
                  style={{ color: v.accent }}
                >
                  {v.tagline}
                </p>
                <p className="text-sm text-text-muted leading-relaxed flex-1">
                  {v.pitch}
                </p>

                {/* CTAs */}
                <div className="mt-6 flex items-center gap-3">
                  {v.url && (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.03]"
                      style={{
                        backgroundColor: v.accent,
                        boxShadow: `0 0 16px ${v.accent}44`,
                      }}
                    >
                      Visit Site <ArrowUpRight size={13} />
                    </a>
                  )}
                  <Link
                    href={`/ventures/${v.slug}`}
                    className="flex items-center gap-1 text-sm text-text-dim hover:text-text-muted transition-colors"
                  >
                    Learn more <ChevronRight size={13} />
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
          <h2 className="text-xs font-semibold tracking-[0.28em] uppercase text-text-dim mb-6">
            Coming soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {other.map((v) => (
              <Link
                key={v.id}
                href={`/ventures/${v.slug}`}
                className="group relative rounded-2xl overflow-hidden transition-all duration-200 hover:border-border-bright"
                style={{
                  background: 'rgba(5,5,18,0.5)',
                  border: '1px dashed rgba(255,255,255,0.08)',
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
        <h2 className="text-xs font-semibold tracking-[0.28em] uppercase text-text-dim mb-6">
          In Incubation
        </h2>
        <div
          className="rounded-2xl px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{
            background: 'rgba(5,5,18,0.5)',
            border: '1px dashed rgba(255,255,255,0.07)',
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
            <p className="text-sm font-semibold text-text-muted">
              More ventures are in the asteroid belt.
            </p>
            <p className="text-xs text-text-dim mt-1">
              Each one orbiting into view when it's ready. Follow the journal for first looks.
            </p>
          </div>
          <Link
            href="/journal"
            className="flex-shrink-0 flex items-center gap-1.5 text-sm text-construx hover:text-orange-400 transition-colors font-medium"
          >
            Journal <ChevronRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
