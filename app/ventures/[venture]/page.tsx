import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { ventures, getVentureBySlug } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ venture: string }>;
}

const SCREENSHOTS: Record<string, string> = {
  scoutr: '/screenshots/scoutr.png',
  'the-marqet': '/screenshots/the-marqet.png',
  'the-hyve': '/screenshots/the-hyve.png',
  'construx-daily': '/screenshots/construx-daily.png',
  'construx-studio': '/screenshots/construx-studio.png',
};

export async function generateStaticParams() {
  return ventures.map((v) => ({ venture: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venture: slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://construxgroup.io';
  const url = `${siteUrl}/ventures/${slug}`;

  return {
    title: `${venture.name} — ${venture.tagline}`,
    description: venture.pitch,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${venture.name} — ${venture.tagline}`,
      description: venture.pitch,
      siteName: 'Construx Group',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${venture.name} — ${venture.tagline}`,
      description: venture.pitch,
    },
  };
}

export default async function VenturePage({ params }: Props) {
  const { venture: slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) notFound();

  const idx = ventures.findIndex((v) => v.id === venture.id);
  const nextVenture = ventures[(idx + 1) % ventures.length];
  const screenshot = SCREENSHOTS[venture.slug] ?? null;

  const allPosts = getAllPostMeta();
  const relatedPosts = (venture.journalSlugs ?? [])
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter(Boolean) as (typeof allPosts)[number][];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://construxgroup.io' },
      { '@type': 'ListItem', position: 2, name: 'Ventures', item: 'https://construxgroup.io/ventures' },
      { '@type': 'ListItem', position: 3, name: venture.name, item: `https://construxgroup.io/ventures/${venture.slug}` },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-20 px-6 lg:px-10 overflow-hidden">
        {/* Accent atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 75% 55% at 50% -10%, ${venture.accent}16, transparent 65%)`,
          }}
        />
        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${venture.accent}90, transparent)` }}
        />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/ventures"
            className="inline-flex items-center gap-2 t-meta hover:text-white/55 transition-colors mb-12 group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            All ventures
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-end">
            {/* Identity */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-7">
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.24em]"
                  style={{ color: venture.accent }}
                >
                  {venture.category}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                  style={{ color: '#4ade80', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.14)' }}
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>

              <h1 className="t-hero mb-6" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
                {venture.name}
              </h1>

              <p
                className="font-display text-[clamp(1.2rem,2.2vw,1.7rem)] leading-snug mb-9"
                style={{ fontWeight: 500, letterSpacing: '-0.015em', color: venture.accent }}
              >
                {venture.tagline}
              </p>

              <div className="flex flex-wrap gap-4">
                {venture.url ? (
                  <a
                    href={venture.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-[13px] font-normal transition-all duration-200 hover:-translate-y-px"
                    style={{
                      color: '#000008',
                      background: venture.accent,
                      boxShadow: `0 6px 32px ${venture.accent}38`,
                    }}
                  >
                    Visit {venture.name} <ArrowUpRight size={14} />
                  </a>
                ) : (
                  <Link href="/contact" className="btn-primary">
                    Start a conversation <ArrowRight size={14} />
                  </Link>
                )}
                <Link href="/contact" className="btn-ghost">
                  Get in touch
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                {venture.stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-5 py-5"
                    style={{
                      background: `${venture.accent}07`,
                      border: `1px solid ${venture.accent}1c`,
                    }}
                  >
                    <p
                      className="font-display text-[22px] leading-tight mb-1"
                      style={{ fontWeight: 700, color: venture.accent }}
                    >
                      {s.value}
                    </p>
                    <p className="t-meta" style={{ fontSize: 8.5 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product frame ── */}
      {screenshot && (
        <section className="relative px-6 lg:px-10 pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="relative group">
              <div
                className="absolute -inset-6 rounded-3xl opacity-40 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 70% 80% at 50% 30%, ${venture.accent}12, transparent 70%)`,
                }}
              />
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 40px 120px -32px rgba(0,0,0,0.9)',
                }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <div
                    className="flex-1 mx-3 h-5 rounded flex items-center px-2.5"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="font-mono text-[9px] text-white/20 truncate">
                      {venture.url ? venture.url.replace('https://', '') : `construxgroup.io/${venture.slug}`}
                    </span>
                  </div>
                </div>
                <div className="relative" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={screenshot}
                    alt={`${venture.name} product screenshot`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Body ── */}
      <section className="px-6 lg:px-10 pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Main */}
            <div className="lg:col-span-8 space-y-20">
              {/* What it is */}
              <div>
                <p className="t-eyebrow mb-5">What it is</p>
                <p
                  className="font-display text-[clamp(1.3rem,2.3vw,1.85rem)] leading-[1.35] text-white/80"
                  style={{ fontWeight: 500, letterSpacing: '-0.015em' }}
                >
                  {venture.what}
                </p>
              </div>

              {/* Why it exists */}
              <div>
                <p className="t-eyebrow mb-5">Why it exists</p>
                <p className="t-lead" style={{ fontSize: 17, lineHeight: 1.75 }}>
                  {venture.pitch}
                </p>
              </div>

              {/* Capabilities */}
              <div>
                <p className="t-eyebrow mb-8">Capabilities</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venture.features.map((f, i) => (
                    <div key={f} className="card px-6 py-5 flex gap-4">
                      <span
                        className="font-mono text-[11px] tabular-nums flex-shrink-0 pt-0.5"
                        style={{ color: venture.accent }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="t-body text-[13.5px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {f}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-5">
                {/* Facts */}
                <div className="card p-7">
                  <p className="t-eyebrow mb-6" style={{ fontSize: 9 }}>Overview</p>
                  <dl className="space-y-4">
                    {[
                      { k: 'Status', v: 'Live', accent: '#4ade80' },
                      { k: 'Category', v: venture.category, accent: venture.accent },
                      { k: 'Group', v: 'Construx' },
                      { k: 'Platform', v: 'AWS Amplify' },
                      { k: 'Engine', v: 'Claude', accent: venture.accent },
                    ].map(({ k, v, accent }) => (
                      <div key={k} className="flex items-center justify-between gap-4">
                        <dt className="t-meta" style={{ fontSize: 9 }}>{k}</dt>
                        <dd
                          className="font-mono text-[11px] uppercase tracking-wider text-right"
                          style={{ color: accent ?? 'rgba(255,255,255,0.5)' }}
                        >
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Stack */}
                <div className="card p-7">
                  <p className="t-eyebrow mb-5" style={{ fontSize: 9 }}>Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {venture.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[9.5px] px-2.5 py-1 rounded"
                        style={{
                          background: `${venture.accent}0c`,
                          border: `1px solid ${venture.accent}20`,
                          color: `${venture.accent}d0`,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                {venture.url && (
                  <a
                    href={venture.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg text-[13px] font-normal transition-all duration-200 hover:-translate-y-px"
                    style={{
                      color: '#000008',
                      background: venture.accent,
                      boxShadow: `0 4px 24px ${venture.accent}30`,
                    }}
                  >
                    Visit site <ArrowUpRight size={13} />
                  </a>
                )}
                <Link
                  href="/contact"
                  className="btn-ghost w-full justify-center"
                >
                  Get in touch
                </Link>
              </div>
            </aside>
          </div>

          {/* ── Related journal ── */}
          {relatedPosts.length > 0 && (
            <div className="mt-28 pt-14 border-t border-border">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="t-eyebrow mb-3">Journal</p>
                  <h2 className="t-section" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>
                    Building {venture.name}.
                  </h2>
                </div>
                <Link href="/journal" className="hidden md:inline-flex btn-text t-meta" style={{ fontSize: 10 }}>
                  All posts <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedPosts.slice(0, 6).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/journal/${post.slug}`}
                    className="group card card-hover p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <time dateTime={post.date} className="t-meta" style={{ fontSize: 9 }}>
                        {formatDate(post.date)}
                      </time>
                      <span className="t-meta" style={{ fontSize: 9 }}>·</span>
                      <span className="t-meta" style={{ fontSize: 9 }}>{post.readingTime} min</span>
                    </div>
                    <p className="t-card text-[15px] leading-snug group-hover:text-white transition-colors">
                      {post.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Next venture ── */}
          <div className="mt-28">
            <Link
              href={`/ventures/${nextVenture.slug}`}
              className="group relative block card overflow-hidden transition-all duration-300 hover:border-white/[0.14]"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 100% at 100% 50%, ${nextVenture.accent}0a, transparent 60%)`,
                }}
              />
              <div className="relative flex items-center justify-between gap-8 px-8 lg:px-12 py-10">
                <div>
                  <p className="t-eyebrow mb-3" style={{ fontSize: 9 }}>Next venture</p>
                  <p
                    className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-none text-white/85 group-hover:text-white transition-colors"
                    style={{ fontWeight: 700, letterSpacing: '-0.025em' }}
                  >
                    {nextVenture.name}
                  </p>
                  <p className="t-body mt-2">{nextVenture.tagline}</p>
                </div>
                <ArrowRight
                  size={28}
                  className="flex-shrink-0 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300"
                />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
