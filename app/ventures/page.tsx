import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'Ventures',
  description:
    'The full portfolio of Construx Group ventures — five live AI-native products.',
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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="min-h-screen pt-36 pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Header */}
          <div className="mb-20 max-w-2xl">
            <p className="t-eyebrow mb-5">Portfolio</p>
            <h1 className="t-page mb-6">
              Five ventures.
              <br />
              All live.
            </h1>
            <p className="t-lead">
              Each one exists because AI makes it possible. Designed from first
              principles, engineered properly, shipped to production.
            </p>
          </div>

          {/* Venture cards */}
          <div className="space-y-5">
            {ventures.map((v, i) => (
              <div
                key={v.id}
                className="group relative card overflow-hidden transition-all duration-300 hover:border-white/[0.14]"
              >
                {/* Accent edge */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: `linear-gradient(180deg, ${v.accent}, ${v.accent}30)` }}
                />
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 60% 100% at 0% 50%, ${v.accent}08, transparent 60%)`,
                  }}
                />

                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 lg:p-10">
                  {/* Left: identity */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-mono text-[11px] tabular-nums" style={{ color: v.accent, opacity: 0.7 }}>
                        0{i + 1}
                      </span>
                      <span
                        className="font-mono text-[9px] uppercase tracking-[0.22em]"
                        style={{ color: v.accent }}
                      >
                        {v.category}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                        style={{ color: '#4ade80', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.14)' }}
                      >
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        Live
                      </span>
                    </div>
                    <h2
                      className="font-display text-white/[0.92] mb-3 leading-none"
                      style={{ fontWeight: 700, fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', letterSpacing: '-0.025em' }}
                    >
                      {v.name}
                    </h2>
                    <p className="text-[15px] font-light mb-6" style={{ color: 'rgba(255,255,255,0.52)' }}>
                      {v.tagline}
                    </p>
                    <div className="flex items-center gap-5">
                      {v.url && (
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-normal transition-opacity hover:opacity-80"
                          style={{ color: v.accent }}
                        >
                          Visit site <ArrowUpRight size={12} />
                        </a>
                      )}
                      <Link href={`/ventures/${v.slug}`} className="btn-text text-[12.5px]">
                        Learn more <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Middle: pitch */}
                  <div className="lg:col-span-4 flex items-center">
                    <p className="t-body text-[13.5px]">{v.what}</p>
                  </div>

                  {/* Right: stats */}
                  <div className="lg:col-span-3 flex items-center">
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      {v.stats.map((s) => (
                        <div
                          key={s.label}
                          className="rounded-lg px-3.5 py-3"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <p
                            className="font-display text-[14px] mb-0.5"
                            style={{ fontWeight: 600, color: v.accent }}
                          >
                            {s.value}
                          </p>
                          <p className="t-meta" style={{ fontSize: 7.5 }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tech stack footer */}
                <div
                  className="relative flex flex-wrap items-center gap-1.5 px-8 lg:px-10 py-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="t-meta mr-3" style={{ fontSize: 8 }}>Stack</span>
                  {v.techStack.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[9px] px-2 py-1 rounded"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.32)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-24 pt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="t-lead" style={{ maxWidth: '40ch' }}>
              Want to see how these get built?
            </p>
            <div className="flex items-center gap-5">
              <Link href="/manifesto" className="btn-ghost">
                Read the manifesto
              </Link>
              <Link href="/journal" className="btn-text">
                Journal <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
