import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import { ventures, getVentureBySlug } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
  params: Promise<{ venture: string }>;
}

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

  const others = ventures.filter((v) => v.id !== venture.id).slice(0, 2);

  const allPosts = getAllPostMeta();
  const relatedPosts = (venture.journalSlugs ?? [])
    .map((slug) => allPosts.find((p) => p.slug === slug))
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
      {/* Hero */}
      <section
        className="relative pt-36 pb-24 px-5 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -5%, ${venture.accent}14, transparent 65%), #000008`,
        }}
      >
        {/* Top accent stripe */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${venture.accent}, transparent)` }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${venture.accent}18 1px,transparent 1px),linear-gradient(90deg,${venture.accent}18 1px,transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom,transparent,#000008)' }}
        />

        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/ventures"
            className="inline-flex items-center gap-1.5 font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors mb-8 group uppercase tracking-widest animate-fade-in"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            // ALL VENTURES
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-6 mb-6 animate-fade-up"
            style={{ animationDelay: '80ms' }}>
            {/* Planet orb */}
            <div
              className="h-20 w-20 rounded-full flex-shrink-0 animate-float"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${venture.accent}dd, ${venture.accent}44)`,
                boxShadow: `0 0 50px ${venture.accent}55, 0 0 100px ${venture.accent}22`,
              }}
            />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={venture.status} />
                <span
                  className="font-mono text-[9px] font-semibold px-2 py-0.5 uppercase tracking-widest"
                  style={{ color: venture.accent, background: `${venture.accent}12`, border: `1px solid ${venture.accent}20`, borderRadius: '2px' }}
                >
                  {venture.category}
                </span>
                <span className="font-mono text-[9px] text-text-dim tracking-wider uppercase">
                  CONSTRUX.GROUP
                </span>
              </div>
              <h1 className="text-display-sm text-text-base mb-2">{venture.name}</h1>
              <p
                className="text-lg font-semibold leading-snug"
                style={{ color: venture.accent }}
              >
                {venture.tagline}
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 animate-fade-up"
            style={{ animationDelay: '200ms' }}>
            {venture.stats.map((s) => (
              <div
                key={s.label}
                className="px-4 py-3"
                style={{
                  background: `${venture.accent}08`,
                  border: `1px solid ${venture.accent}1E`,
                  borderRadius: '2px',
                }}
              >
                <p
                  className="font-mono text-lg font-semibold leading-tight mb-0.5 tabular-nums"
                  style={{ color: venture.accent }}
                >
                  {s.value}
                </p>
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '320ms' }}>
            {venture.url ? (
              <a
                href={venture.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-semibold text-black transition-all hover:scale-[1.02] uppercase tracking-wider"
                style={{
                  backgroundColor: venture.accent,
                  boxShadow: `0 0 24px ${venture.accent}44`,
                  borderRadius: '3px',
                }}
              >
                Visit {venture.name} <ArrowUpRight size={15} />
              </a>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-wider"
                style={{ borderRadius: '3px' }}
              >
                Get early access <ChevronRight size={15} />
              </Link>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx/40 transition-all uppercase tracking-wider"
              style={{ borderRadius: '3px' }}
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 pb-24 mx-auto max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main copy */}
          <div className="lg:col-span-2 space-y-6">
            {/* What it is */}
            <div
              className="overflow-hidden"
              style={{
                background: 'rgba(3,3,14,0.8)',
                border: `1px solid ${venture.accent}14`,
                borderRadius: '3px',
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5 select-none"
                style={{ background: 'rgba(0,0,8,0.4)', borderBottom: `1px solid ${venture.accent}10` }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: `${venture.accent}60` }}>
                  {venture.slug}.overview — what it is
                </span>
              </div>
              <div className="p-6">
                <p className="text-text-muted leading-relaxed text-base">{venture.what}</p>
              </div>
            </div>

            {/* The pitch */}
            <div
              className="overflow-hidden"
              style={{
                background: 'rgba(3,3,14,0.8)',
                border: `1px solid ${venture.accent}14`,
                borderRadius: '3px',
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5 select-none"
                style={{ background: 'rgba(0,0,8,0.4)', borderBottom: `1px solid ${venture.accent}10` }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: `${venture.accent}60` }}>
                  {venture.slug}.pitch — why it exists
                </span>
              </div>
              <div className="p-6">
                <p className="text-text-muted leading-relaxed text-base">{venture.pitch}</p>
              </div>
            </div>

            {/* Key capabilities */}
            <div
              className="overflow-hidden"
              style={{
                background: 'rgba(3,3,14,0.8)',
                border: `1px solid ${venture.accent}14`,
                borderRadius: '3px',
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5 select-none"
                style={{ background: 'rgba(0,0,8,0.4)', borderBottom: `1px solid ${venture.accent}10` }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: `${venture.accent}60` }}>
                  {venture.slug}.capabilities — {venture.features.length} modules
                </span>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {venture.features.map((f, i) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="font-mono text-[10px] flex-shrink-0 mt-0.5 tabular-nums" style={{ color: venture.accent }}>
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span className="text-sm text-text-muted leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* System info block */}
            <div
              className="overflow-hidden"
              style={{ background: 'rgba(3,3,14,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-3 py-2 border-b border-border select-none"
                style={{ background: 'rgba(255,255,255,0.01)' }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  sys.info
                </span>
              </div>
              <div className="p-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Status</span>
                  <StatusBadge status={venture.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Category</span>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider" style={{ color: venture.accent }}>
                    {venture.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Group</span>
                  <Link href="/" className="font-mono text-[10px] text-text-muted hover:text-text-base transition-colors uppercase tracking-wider">
                    Construx
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Deploy</span>
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">AWS.AMPLIFY</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Engine</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: venture.accent }}>CLAUDE.API</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Orbit.R</span>
                  <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider tabular-nums">{venture.orbitRadius} AU</span>
                </div>
              </div>
              </div>
            </div>

            {/* Latency panel */}
            <div
              className="overflow-hidden"
              style={{ background: 'rgba(3,3,14,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2 select-none"
                style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  net.latency
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-end gap-0.5 mb-2">
                  {venture.latencyBars.split('').map((bar, i) => (
                    <span
                      key={i}
                      className="font-mono text-[11px] leading-none tabular-nums"
                      style={{ color: `${venture.accent}${i % 4 === 0 ? 'cc' : '66'}` }}
                    >
                      {bar}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-text-dim uppercase tracking-wider">p50</span>
                  <span className="font-mono text-[9px] tabular-nums" style={{ color: venture.accent }}>{'<'}80ms</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[9px] text-text-dim uppercase tracking-wider">uptime</span>
                  <span className="font-mono text-[9px] tabular-nums text-text-muted">99.9%</span>
                </div>
              </div>
            </div>

            {/* Tech stack panel */}
            <div
              className="overflow-hidden"
              style={{ background: 'rgba(3,3,14,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2 select-none"
                style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  tech.stack — {venture.techStack.length} layers
                </span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5">
                  {venture.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[9px] px-2 py-0.5 uppercase tracking-wider"
                      style={{
                        background: `${venture.accent}10`,
                        border: `1px solid ${venture.accent}22`,
                        borderRadius: '2px',
                        color: `${venture.accent}cc`,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visit CTA */}
            {venture.url && (
              <a
                href={venture.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 font-mono text-xs font-semibold text-black transition-all hover:scale-[1.02] uppercase tracking-wider"
                style={{
                  backgroundColor: venture.accent,
                  borderRadius: '3px',
                  boxShadow: `0 0 20px ${venture.accent}44`,
                }}
              >
                VISIT SITE <ArrowUpRight size={14} />
              </a>
            )}

            {/* Contact CTA */}
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full py-3 font-mono text-xs font-medium uppercase tracking-wider text-text-muted hover:text-text-base transition-all"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '3px',
              }}
            >
              GET IN TOUCH
            </Link>
          </div>
        </div>

        {/* Related journal posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-dim">
                // FROM THE JOURNAL
              </h2>
              <Link
                href="/journal"
                className="font-mono text-[10px] text-construx hover:text-orange-400 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                All posts <ChevronRight size={11} />
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 px-5 py-4 transition-all hover:bg-subtle border border-transparent hover:border-construx/15"
                  style={{ borderRadius: '3px', background: 'rgba(5,5,18,0.5)' }}
                >
                  <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
                    <BookOpen size={11} className="text-text-dim flex-shrink-0" />
                    <time dateTime={post.date} className="font-mono text-[10px] text-text-dim tabular-nums">
                      {formatDate(post.date)}
                    </time>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest"
                        style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '2px' }}
                      >
                        {post.tag}
                      </span>
                      <span className="font-mono text-[10px] text-text-dim">{post.readingTime} min read</span>
                    </div>
                    <p className="text-sm font-semibold text-text-base group-hover:text-text-base transition-colors leading-snug">
                      {post.title}
                    </p>
                  </div>
                  <ChevronRight size={13} className="flex-shrink-0 text-text-dim group-hover:text-text-muted group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other ventures */}
        {others.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border">
            <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-dim mb-6">
              // OTHER VENTURES
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {others.map((v) => (
                <Link
                  key={v.id}
                  href={`/ventures/${v.slug}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-all bg-[rgba(5,5,18,0.6)] hover:bg-subtle"
                  style={{ border: `1px solid ${v.accent}18`, borderRadius: '3px' }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}bb, ${v.accent}44)`,
                      boxShadow: `0 0 14px ${v.accent}44`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-base">{v.name}</p>
                    <p className="text-xs text-text-dim truncate">{v.tagline}</p>
                  </div>
                  <ChevronRight size={14} className="text-text-dim group-hover:text-text-muted transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
