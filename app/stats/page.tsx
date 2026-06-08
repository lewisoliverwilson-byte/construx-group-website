import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'Stats',
  description: 'Live metrics across the Construx Group portfolio.',
};

export default function StatsPage() {
  const allPosts = getAllPostMeta();
  const live = ventures.filter(v => v.status === 'live');
  const dev = ventures.filter(v => v.status === 'dev');
  const now = new Date();
  const launchDate = new Date('2026-03-01');
  const daysSinceLaunch = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));

  const TOP_METRICS = [
    { label: 'Live ventures', value: String(live.length), accent: '#C8F50C', desc: 'Products in production' },
    { label: 'In development', value: String(dev.length), accent: '#F59E0B', desc: 'Ventures building now' },
    { label: 'Journal posts', value: String(allPosts.length), accent: '#3B82F6', desc: 'Published dispatches' },
    { label: 'Days running', value: String(daysSinceLaunch), accent: '#8B5CF6', desc: 'Since first launch' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">Stats</p>
          <h1
            className="text-display text-white/90 mb-4"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            Portfolio metrics.
          </h1>
          <p className="text-[14px] text-white/38 font-light">
            Last updated: {now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {TOP_METRICS.map(({ label, value, accent, desc }) => (
            <div
              key={label}
              className="glass rounded-lg p-5"
              style={{ borderTop: `2px solid ${accent}` }}
            >
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/25 mb-3">{label}</p>
              <p
                className="text-[clamp(2rem,5vw,3.2rem)] leading-none mb-2"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, color: accent }}
              >
                {value}
              </p>
              <p className="text-[11px] text-white/28 font-light">{desc}</p>
            </div>
          ))}
        </div>

        {/* Per-venture stats */}
        <section className="mb-12">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 mb-5">By venture</p>
          <div className="space-y-3">
            {ventures.map((v) => (
              <div
                key={v.id}
                className="glass rounded-lg p-6"
                style={{ borderLeft: `3px solid ${v.accent}`, borderTop: 'none', opacity: v.status === 'dev' ? 0.7 : 1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className="text-[18px] text-white/85"
                        style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
                      >
                        {v.name}
                      </h3>
                      <span
                        className="font-mono text-[7.5px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-sm"
                        style={
                          v.status === 'live'
                            ? { color: '#4ade80', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }
                            : { color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        {v.status === 'live' ? 'Live' : 'In Development'}
                      </span>
                    </div>
                    <p className="font-mono text-[8px] text-white/22 uppercase tracking-wider">{v.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {v.stats.map((s) => (
                    <div key={s.label} className="bg-white/[0.03] rounded px-3 py-2.5 border border-white/[0.05]">
                      <p className="font-mono text-[7.5px] text-white/20 uppercase tracking-wider mb-1">{s.label}</p>
                      <p
                        className="text-[16px] font-semibold"
                        style={{ fontFamily: 'Clash Display, system-ui, sans-serif', color: v.accent }}
                      >
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Journal stats */}
        {allPosts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">Journal</p>
              <Link href="/journal" className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/22 hover:text-white/50 transition-colors flex items-center gap-1.5">
                All posts <ArrowRight size={9} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-lg p-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22 mb-3">Total posts</p>
                <p
                  className="text-[2.4rem] leading-none text-white/88"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
                >
                  {allPosts.length}
                </p>
              </div>
              <div className="glass rounded-lg p-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22 mb-3">Latest</p>
                <p className="text-[12px] text-white/52 font-light leading-snug">
                  {allPosts[0]?.title ?? '—'}
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-5">
          <Link href="/ventures" className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/28 hover:text-white/55 transition-colors flex items-center gap-1.5">
            All ventures <ArrowRight size={10} />
          </Link>
          <Link href="/journal" className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/28 hover:text-white/55 transition-colors flex items-center gap-1.5">
            Journal <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}
