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
  const now = new Date();
  const launchDate = new Date('2026-03-01');
  const daysSinceLaunch = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));

  const TOP_METRICS = [
    { label: 'Live ventures', value: String(live.length), accent: '#C8F50C', desc: 'Products in production' },
    { label: 'Marqet listings', value: '167+', accent: '#3B82F6', desc: 'Claude configurations' },
    { label: 'Journal posts', value: String(allPosts.length), accent: '#8B5CF6', desc: 'Published dispatches' },
    { label: 'Days running', value: String(daysSinceLaunch), accent: '#F59E0B', desc: 'Since first launch' },
  ];

  return (
    <div className="min-h-screen pt-36 pb-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Stats</p>
          <h1 className="t-page mb-5">Portfolio metrics.</h1>
          <p className="t-meta">
            Last updated {now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {TOP_METRICS.map(({ label, value, accent, desc }) => (
            <div key={label} className="relative card overflow-hidden p-6">
              <span
                className="absolute left-0 top-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}20)` }}
              />
              <p className="t-meta mb-4" style={{ fontSize: 8.5 }}>{label}</p>
              <p
                className="font-display leading-none mb-2"
                style={{ fontWeight: 700, fontSize: 'clamp(2rem,4.5vw,3rem)', color: accent }}
              >
                {value}
              </p>
              <p className="t-body text-[11.5px]">{desc}</p>
            </div>
          ))}
        </div>

        {/* Per-venture stats */}
        <section className="mb-16">
          <p className="t-eyebrow mb-6">By venture</p>
          <div className="space-y-4">
            {ventures.map((v) => (
              <div key={v.id} className="relative card overflow-hidden p-7">
                <span
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: `linear-gradient(180deg, ${v.accent}, ${v.accent}30)` }}
                />
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <h3 className="t-card text-[18px]">{v.name}</h3>
                  <span
                    className="inline-flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                    style={{ color: '#4ade80', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.14)' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Live
                  </span>
                  <span className="t-meta" style={{ fontSize: 8.5 }}>{v.category}</span>
                  <Link
                    href={`/ventures/${v.slug}`}
                    className="ml-auto btn-text t-meta hidden sm:inline-flex"
                    style={{ fontSize: 9 }}
                  >
                    Details <ArrowRight size={10} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {v.stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p
                        className="font-display text-[16px] mb-1"
                        style={{ fontWeight: 600, color: v.accent }}
                      >
                        {s.value}
                      </p>
                      <p className="t-meta" style={{ fontSize: 7.5 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Journal stats */}
        {allPosts.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <p className="t-eyebrow">Journal</p>
              <Link href="/journal" className="btn-text t-meta" style={{ fontSize: 10 }}>
                All posts <ArrowRight size={10} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-6">
                <p className="t-meta mb-4" style={{ fontSize: 8.5 }}>Total posts</p>
                <p
                  className="font-display text-[2.6rem] leading-none text-white/90"
                  style={{ fontWeight: 700 }}
                >
                  {allPosts.length}
                </p>
              </div>
              <div className="card p-6">
                <p className="t-meta mb-4" style={{ fontSize: 8.5 }}>Latest dispatch</p>
                <p className="t-card text-[15px] leading-snug">{allPosts[0]?.title ?? '—'}</p>
              </div>
            </div>
          </section>
        )}

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-6">
          <Link href="/ventures" className="btn-text">
            All ventures <ArrowRight size={12} />
          </Link>
          <Link href="/journal" className="btn-text">
            Journal <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
