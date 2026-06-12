import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'The Construx Group project index — five operational AI-native products, all built in-house.',
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Construx Group Projects',
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
  const live = ventures.filter((v) => v.status === 'live');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="min-h-screen pt-40 pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Header */}
          <div className="mb-16">
            <p className="t-eyebrow mb-5">Project index</p>
            <h1 className="t-page mb-7">The manifest.</h1>
            <p className="t-lead" style={{ maxWidth: '52ch' }}>
              Five operational products, designed and engineered in-house. Each one
              is a working answer to the same question: what becomes buildable when
              AI is the engine, not the feature?
            </p>
          </div>

          <div className="title-rule mb-0" />

          {/* Manifest */}
          <div>
            {live.map((v, i) => (
              <div
                key={v.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 py-12 border-b"
                style={{ borderColor: 'var(--hairline)' }}
              >
                {/* Index + identity */}
                <div className="lg:col-span-4 flex gap-6">
                  <span className="font-mono text-[12px] tabular-nums pt-2" style={{ color: 'var(--ink-faint)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2
                      className="font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-none mb-2.5"
                      style={{ fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--ink)' }}
                    >
                      {v.name}
                    </h2>
                    <p className="t-meta mb-4">{v.category}</p>
                    <span className="flex items-center gap-2 t-meta">
                      <span className="dot-live" style={{ width: 5, height: 5 }} />
                      Live · since 2026
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="lg:col-span-5">
                  <p className="font-serif-body text-[16px] mb-4" style={{ color: 'var(--ink)' }}>
                    {v.tagline}
                  </p>
                  <p className="t-body text-[14px]" style={{ maxWidth: '52ch' }}>
                    {v.what}
                  </p>
                </div>

                {/* Facts + links */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <dl className="flex flex-col">
                    {v.stats.slice(0, 3).map((s) => (
                      <div
                        key={s.label}
                        className="flex items-baseline justify-between gap-4 py-2 border-b"
                        style={{ borderColor: 'var(--hairline)' }}
                      >
                        <dt className="t-meta" style={{ fontSize: 9.5 }}>{s.label}</dt>
                        <dd className="font-mono text-[12px]" style={{ color: 'var(--ink)' }}>{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex items-center gap-5 pt-1">
                    <Link href={`/ventures/${v.slug}`} className="btn-text">
                      Detail <ArrowRight size={11} />
                    </Link>
                    {v.url && (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-text"
                        style={{ color: 'var(--ink)' }}
                      >
                        Visit <ArrowUpRight size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="t-meta">5 entries / all operational / built in-house</p>
            <Link href="/work-with-us" className="btn-line">
              Commission the studio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
