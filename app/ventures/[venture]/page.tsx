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
      { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://construxgroup.io/ventures' },
      { '@type': 'ListItem', position: 3, name: venture.name, item: `https://construxgroup.io/ventures/${venture.slug}` },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Title block ── */}
      <section className="relative pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Link href="/ventures" className="btn-text mb-14 inline-flex group">
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            Project index
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-10">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-5 mb-6">
                <span className="font-mono text-[12px] tabular-nums" style={{ color: 'var(--ink-faint)' }}>
                  PROJECT {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="t-meta">{venture.category}</span>
                <span className="flex items-center gap-2 t-meta">
                  <span className="dot-live" style={{ width: 5, height: 5 }} />
                  Live
                </span>
              </div>
              <h1 className="t-hero mb-5" style={{ fontSize: 'clamp(2.8rem,6.5vw,5.6rem)' }}>
                {venture.name}
              </h1>
              <p className="font-serif-body text-[clamp(1.1rem,2vw,1.45rem)]" style={{ color: 'var(--ink-muted)' }}>
                {venture.tagline}
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end gap-4">
              {venture.url ? (
                <a href={venture.url} target="_blank" rel="noopener noreferrer" className="btn-ink">
                  Visit site <ArrowUpRight size={13} />
                </a>
              ) : (
                <Link href="/contact" className="btn-ink">
                  Enquire <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>

          <div className="title-rule" />

          {/* Fact strip */}
          <div className="flex flex-wrap gap-x-12 gap-y-3 pt-5">
            {venture.stats.map((s) => (
              <span key={s.label} className="t-fact">
                <span className="t-meta mr-2.5" style={{ fontSize: 10 }}>{s.label}</span>
                {s.value}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product frame ── */}
      {screenshot && (
        <section className="px-6 lg:px-10 pb-20">
          <div className="mx-auto max-w-6xl">
            <div
              className="relative overflow-hidden"
              style={{ border: '1px solid var(--hairline)', borderRadius: 2 }}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ background: 'var(--paper-raised)', borderColor: 'var(--hairline)' }}
              >
                <span className="t-meta" style={{ fontSize: 10 }}>
                  FIG. {String(idx + 1).padStart(2, '0')} — {venture.name} / production interface
                </span>
                <span className="reg-mark" style={{ transform: 'scale(0.75)' }} />
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
        </section>
      )}

      {/* ── Body ── */}
      <section className="px-6 lg:px-10 pb-28 border-t" style={{ borderColor: 'var(--hairline)' }}>
        <div className="mx-auto max-w-7xl pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Main */}
            <div className="lg:col-span-8 space-y-20">
              <div>
                <p className="t-eyebrow mb-6">What it is</p>
                <p
                  className="font-display text-[clamp(1.25rem,2.2vw,1.7rem)] leading-[1.35]"
                  style={{ fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}
                >
                  {venture.what}
                </p>
              </div>

              <div>
                <p className="t-eyebrow mb-6">Why it exists</p>
                <p className="t-lead" style={{ maxWidth: '62ch' }}>{venture.pitch}</p>
              </div>

              <div>
                <p className="t-eyebrow mb-8">Capabilities</p>
                <div className="border-t" style={{ borderColor: 'var(--hairline)' }}>
                  {venture.features.map((f, i) => (
                    <div
                      key={f}
                      className="flex gap-6 py-5 border-b"
                      style={{ borderColor: 'var(--hairline)' }}
                    >
                      <span className="font-mono text-[11px] tabular-nums pt-0.5 flex-shrink-0" style={{ color: 'var(--ink-faint)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="t-body text-[15px]" style={{ color: '#46443e' }}>{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-8">
                <div>
                  <p className="t-eyebrow mb-5" style={{ fontSize: 9.5 }}>Specification</p>
                  <dl className="flex flex-col">
                    {[
                      { k: 'Status', v: 'Live' },
                      { k: 'Category', v: venture.category },
                      { k: 'Studio', v: 'Construx Group' },
                      { k: 'Platform', v: 'AWS Amplify' },
                      { k: 'Engine', v: 'Claude' },
                    ].map(({ k, v }) => (
                      <div
                        key={k}
                        className="flex items-baseline justify-between gap-4 py-3 border-b"
                        style={{ borderColor: 'var(--hairline)' }}
                      >
                        <dt className="t-meta" style={{ fontSize: 9.5 }}>{k}</dt>
                        <dd className="font-mono text-[11.5px] uppercase tracking-wider text-right" style={{ color: 'var(--ink)' }}>
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <p className="t-eyebrow mb-5" style={{ fontSize: 9.5 }}>Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {venture.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] px-2.5 py-1.5"
                        style={{
                          border: '1px solid var(--hairline)',
                          borderRadius: 2,
                          color: 'var(--ink-muted)',
                          background: 'var(--paper-raised)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {venture.url && (
                  <a
                    href={venture.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ink w-full justify-center"
                  >
                    Visit {venture.name} <ArrowUpRight size={13} />
                  </a>
                )}
                <Link href="/contact" className="btn-line w-full justify-center">
                  Get in touch
                </Link>
              </div>
            </aside>
          </div>

          {/* ── Related journal ── */}
          {relatedPosts.length > 0 && (
            <div className="mt-28 pt-14 border-t" style={{ borderColor: 'var(--hairline)' }}>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="t-eyebrow mb-3">From the journal</p>
                  <h2 className="t-section" style={{ fontSize: 'clamp(1.5rem,2.8vw,2.2rem)' }}>
                    Building {venture.name}.
                  </h2>
                </div>
                <Link href="/blog" className="btn-text hidden md:inline-flex">
                  All entries <ArrowRight size={11} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--hairline)' }}>
                {relatedPosts.slice(0, 6).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group p-7"
                    style={{ background: 'var(--paper)' }}
                  >
                    <p className="t-meta mb-4" style={{ fontSize: 9.5 }}>
                      {formatDate(post.date)} · {post.readingTime} min
                    </p>
                    <p
                      className="t-card text-[16px] leading-snug group-hover:underline"
                      style={{ textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
                    >
                      {post.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Next project ── */}
          <div className="mt-24">
            <Link
              href={`/ventures/${nextVenture.slug}`}
              className="group flex items-center justify-between gap-8 py-10 border-t border-b transition-colors"
              style={{ borderColor: 'var(--hairline)' }}
            >
              <div>
                <p className="t-meta mb-3">Next project</p>
                <p
                  className="font-display text-[clamp(1.7rem,3.4vw,2.7rem)] leading-none group-hover:underline"
                  style={{
                    fontWeight: 600,
                    letterSpacing: '-0.025em',
                    color: 'var(--ink)',
                    textDecorationColor: 'var(--orange)',
                    textUnderlineOffset: 6,
                  }}
                >
                  {nextVenture.name}
                </p>
              </div>
              <ArrowRight
                size={26}
                className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: 'var(--ink-faint)' }}
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
