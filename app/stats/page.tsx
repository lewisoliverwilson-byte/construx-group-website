import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'Stats',
  description: 'Studio metrics, plainly stated.',
};

export default function StatsPage() {
  const allPosts = getAllPostMeta();
  const live = ventures.filter(v => v.status === 'live');
  const now = new Date();
  const launchDate = new Date('2026-03-01');
  const daysSinceLaunch = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));

  const TOP_METRICS = [
    { label: 'Products live', value: String(live.length), desc: 'All operational, all in-house' },
    { label: 'Marqet listings', value: '167+', desc: 'Claude configurations published' },
    { label: 'Journal entries', value: String(allPosts.length), desc: 'Working notes published' },
    { label: 'Days running', value: String(daysSinceLaunch), desc: 'Since first launch' },
  ];

  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Stats</p>
          <h1 className="t-page mb-6">The numbers.</h1>
          <p className="t-meta">
            As of {now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="title-rule mb-0" />

        {/* Top metrics */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px mb-20 border-b"
          style={{ background: 'var(--hairline)', borderColor: 'var(--hairline)' }}
        >
          {TOP_METRICS.map(({ label, value, desc }) => (
            <div key={label} className="p-7" style={{ background: 'var(--paper)' }}>
              <p className="t-meta mb-5" style={{ fontSize: 9.5 }}>{label}</p>
              <p
                className="font-display leading-none mb-3"
                style={{ fontWeight: 600, fontSize: 'clamp(2rem,4.5vw,3.2rem)', color: 'var(--ink)' }}
              >
                {value}
              </p>
              <p className="t-body text-[12px]">{desc}</p>
            </div>
          ))}
        </div>

        {/* Per-project */}
        <section className="mb-16">
          <p className="t-eyebrow mb-8">By project</p>
          <div className="border-t" style={{ borderColor: 'var(--hairline)' }}>
            {live.map((v, i) => (
              <div
                key={v.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 py-8 border-b"
                style={{ borderColor: 'var(--hairline)' }}
              >
                <div className="md:col-span-4 flex gap-5">
                  <span className="font-mono text-[11px] tabular-nums pt-1.5" style={{ color: 'var(--ink-faint)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="t-card text-[18px] mb-1">{v.name}</h3>
                    <p className="t-meta" style={{ fontSize: 9.5 }}>{v.category}</p>
                  </div>
                </div>
                <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
                  {v.stats.map((s) => (
                    <div key={s.label}>
                      <p className="font-mono text-[14px] mb-1" style={{ color: 'var(--ink)' }}>{s.value}</p>
                      <p className="t-meta" style={{ fontSize: 8.5 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-2 flex flex-wrap gap-7">
          <Link href="/ventures" className="btn-text">
            The manifest <ArrowRight size={11} />
          </Link>
          <Link href="/journal" className="btn-text">
            Journal <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
