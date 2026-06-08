import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'Ventures',
  description:
    'The full portfolio of Construx Group ventures — live products and ventures in development.',
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Construx Group Ventures',
  url: 'https://construxgroup.io/ventures',
  itemListElement: ventures.map((v, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: v.name,
    description: v.tagline,
    url: v.url ?? `https://construxgroup.io/ventures/${v.slug}`,
  })),
};

export default function VenturesPage() {
  const live = ventures.filter(v => v.status === 'live');
  const dev = ventures.filter(v => v.status === 'dev');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="min-h-screen pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          {/* Header */}
          <div className="mb-16">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">Portfolio</p>
            <h1
              className="text-display text-white/90 mb-5"
              style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
            >
              Ventures
            </h1>
            <p className="text-[15px] text-white/40 font-light max-w-lg leading-relaxed">
              Five AI-native products. Each one exists because AI makes it possible.
            </p>
          </div>

          {/* Live ventures */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">Live</p>
              <span
                className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-sm"
                style={{ color: '#4ade80', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}
              >
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                {live.length} active
              </span>
            </div>
            <div className="space-y-4">
              {live.map((v) => (
                <a
                  key={v.id}
                  href={v.url ?? `/ventures/${v.slug}`}
                  target={v.url ? '_blank' : undefined}
                  rel={v.url ? 'noopener noreferrer' : undefined}
                  className="group glass rounded-lg p-7 flex flex-col md:flex-row md:items-start gap-6 hover:-translate-y-0.5 transition-all duration-200 block"
                  style={{ borderTop: `2px solid ${v.accent}` }}
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: v.accent }}>
                        {v.category}
                      </p>
                      {v.url && (
                        <ArrowUpRight size={14} className="text-white/22 group-hover:text-white/55 transition-colors flex-shrink-0" />
                      )}
                    </div>
                    <h2
                      className="text-[28px] text-white/88 mb-2 leading-[0.96]"
                      style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
                    >
                      {v.name}
                    </h2>
                    <p className="text-[14px] text-white/42 font-light leading-relaxed mb-4">{v.tagline}</p>
                    <p className="text-[13px] text-white/32 font-light leading-relaxed max-w-xl">{v.pitch}</p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-48">
                    <div className="grid grid-cols-2 gap-2">
                      {v.stats.map((s) => (
                        <div key={s.label} className="bg-white/[0.03] rounded px-3 py-2.5 border border-white/[0.05]">
                          <p className="font-mono text-[7.5px] text-white/22 uppercase tracking-wider mb-1">{s.label}</p>
                          <p
                            className="text-[15px] font-semibold"
                            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', color: v.accent }}
                          >
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {v.techStack.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[8px] px-2 py-1 rounded-sm"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Dev ventures */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">In Development</p>
              <span
                className="font-mono text-[8px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-sm"
                style={{ color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {dev.length} building
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dev.map((v) => (
                <div
                  key={v.id}
                  className="glass rounded-lg p-7"
                  style={{ borderTop: `2px solid ${v.accent}`, opacity: 0.75 }}
                >
                  <p className="font-mono text-[8px] uppercase tracking-[0.2em] mb-3" style={{ color: v.accent }}>
                    {v.category}
                  </p>
                  <h2
                    className="text-[24px] text-white/75 mb-2"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
                  >
                    {v.name}
                  </h2>
                  <p className="text-[13px] text-white/38 font-light leading-relaxed mb-4">{v.tagline}</p>
                  <p className="text-[12.5px] text-white/28 font-light leading-relaxed">{v.pitch}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
