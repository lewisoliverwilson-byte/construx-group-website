import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate as fd } from '@/lib/utils';
import ActivityHistogram from '@/components/journal/ActivityHistogram';
import JournalStats from '@/components/journal/JournalStats';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Build-in-public posts and insight pieces from Construx Group. The honest record of what we build and how.',
};

const TAG_PALETTE: Record<string, { accent: string; bg: string; border: string; rowBorder: string }> = {
  Strategy:    { accent: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.22)',  rowBorder: 'rgba(249,115,22,0.28)' },
  'Build Log': { accent: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.22)',  rowBorder: 'rgba(74,222,128,0.28)' },
  Product:     { accent: '#7dd3fc', bg: 'rgba(125,211,252,0.1)', border: 'rgba(125,211,252,0.22)', rowBorder: 'rgba(125,211,252,0.28)' },
  Methodology: { accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.22)', rowBorder: 'rgba(167,139,250,0.28)' },
  Process:     { accent: '#67e8f9', bg: 'rgba(103,232,249,0.1)', border: 'rgba(103,232,249,0.22)',  rowBorder: 'rgba(103,232,249,0.28)' },
};

const DEFAULT_PALETTE = TAG_PALETTE.Strategy;

interface Props {
  searchParams: Promise<{ tag?: string }>;
}

export default async function JournalPage({ searchParams }: Props) {
  const { tag: activeTag } = await searchParams;
  const allPosts = getAllPostMeta();
  const posts = activeTag ? allPosts.filter((p) => p.tag === activeTag) : allPosts;
  const tags = [...new Set(allPosts.map((p) => p.tag))].sort();

  // Activity histogram data
  const monthCounts = new Map<string, number>();
  allPosts.forEach((p) => {
    const key = p.date.slice(0, 7);
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  });
  const sortedMonths = [...monthCounts.entries()].sort(([a], [b]) => a.localeCompare(b));
  const maxCount = Math.max(...sortedMonths.map(([, c]) => c), 1);
  const histogramBars = sortedMonths.map(([key, count]) => ({
    label: new Date(key + '-02').toLocaleString('en', { month: 'short' }),
    count,
    pct: count / maxCount,
  }));

  const totalReadingTime = allPosts.reduce((sum, p) => sum + p.readingTime, 0);
  const avgReadingTime = allPosts.length > 0 ? Math.round(totalReadingTime / allPosts.length) : 0;
  const peakMonthEntry = sortedMonths.reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0]);
  const peakMonthLabel = peakMonthEntry[0]
    ? new Date(peakMonthEntry[0] + '-02').toLocaleString('en', { month: 'short', year: '2-digit' })
    : '—';
  const statsRows = [
    { label: 'DISPATCHES', value: String(allPosts.length).padStart(3, '0'), accent: '#F97316' },
    { label: 'READ TIME', value: `${totalReadingTime}m`, accent: 'rgba(240,239,255,0.85)' },
    { label: 'AVG LENGTH', value: `${avgReadingTime}m`, accent: 'rgba(240,239,255,0.85)' },
    { label: 'PEAK MONTH', value: peakMonthLabel, accent: 'rgba(103,232,249,0.85)' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4 animate-fade-in">
            // BUILD IN PUBLIC
          </p>
          <h1
            className="text-display text-text-base mb-5 leading-none animate-fade-up"
            style={{ animationDelay: '90ms', animationFillMode: 'both' }}
          >
            The <span className="text-gradient-orange">Journal</span>
          </h1>
          <p
            className="text-text-muted text-base leading-relaxed max-w-lg animate-fade-up"
            style={{ animationDelay: '220ms', animationFillMode: 'both' }}
          >
            The honest record of what we're building, how we're building it,
            and what AI at the frontier actually looks like in practice.
          </p>

          <div
            className="flex items-center gap-4 mt-6 animate-fade-up"
            style={{ animationDelay: '350ms', animationFillMode: 'both' }}
          >
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-construx opacity-70" />
              {String(allPosts.length).padStart(3, '0')} DISPATCHES
            </span>
            {activeTag ? (
              <span className="font-mono text-[9px] text-construx uppercase tracking-[0.2em]">
                FILTER: {activeTag}
              </span>
            ) : (
              <span className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em]">
                SIGNAL: LIVE
              </span>
            )}
          </div>

          {!activeTag && <JournalStats rows={statsRows} />}

          {/* Tag filter chips */}
          <div
            className="flex flex-wrap gap-2 mt-4 animate-fade-up"
            style={{ animationDelay: '440ms', animationFillMode: 'both' }}
          >
            {tags.map((tag) => {
              const count = allPosts.filter((p) => p.tag === tag).length;
              const isActive = activeTag === tag;
              const palette = TAG_PALETTE[tag] ?? DEFAULT_PALETTE;
              return (
                <Link
                  key={tag}
                  href={isActive ? '/journal' : `/journal?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[9px] font-medium px-2.5 py-1 uppercase tracking-widest transition-all"
                  style={{
                    background: isActive ? palette.bg : 'rgba(255,255,255,0.04)',
                    border: isActive ? `1px solid ${palette.border}` : '1px solid rgba(255,255,255,0.08)',
                    color: isActive ? palette.accent : 'rgba(240,239,255,0.45)',
                    borderRadius: '2px',
                  }}
                >
                  {tag}
                  {isActive ? (
                    <X size={9} />
                  ) : (
                    <span style={{ color: palette.accent, opacity: 0.6 }}>{count}</span>
                  )}
                </Link>
              );
            })}
            {activeTag && (
              <Link
                href="/journal"
                className="inline-flex items-center gap-1 font-mono text-[9px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest px-2 py-1"
              >
                <X size={9} /> Clear filter
              </Link>
            )}
          </div>

          {/* Activity histogram */}
          {!activeTag && (
            <ActivityHistogram bars={histogramBars} total={allPosts.length} />
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="px-5 py-20 mx-auto max-w-3xl">
        {activeTag && (
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              {String(posts.length).padStart(3, '0')} RESULTS — TAG: {activeTag}
            </p>
            <Link
              href="/journal"
              className="font-mono text-[9px] text-construx hover:text-orange-400 transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              <X size={9} /> SHOW ALL
            </Link>
          </div>
        )}
        {posts.length === 0 ? (
          <div
            className="px-8 py-12 text-center"
            style={{ background: 'rgba(5,5,18,0.5)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '3px' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-dim">
              {activeTag ? `NO DISPATCHES TAGGED: ${activeTag}` : 'SIGNAL PENDING — FIRST POST INCOMING'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: '2px' }}>
            {posts.map((post) => {
              const globalIndex = allPosts.findIndex((p) => p.slug === post.slug);
              const palette = TAG_PALETTE[post.tag] ?? DEFAULT_PALETTE;
              return (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7 px-6 py-5 transition-all hover:bg-subtle"
                  style={{
                    borderRadius: '3px',
                    background: 'rgba(5,5,18,0.55)',
                    borderLeft: `2px solid ${palette.rowBorder}`,
                    border: `1px solid rgba(255,255,255,0.04)`,
                    borderLeftWidth: '2px',
                    borderLeftColor: palette.rowBorder,
                  }}
                >
                  <div className="flex items-center gap-4 flex-shrink-0 sm:w-44">
                    <span
                      className="font-mono text-[9px] tabular-nums w-6 text-right flex-shrink-0"
                      style={{ color: `${palette.accent}55` }}
                    >
                      #{String(allPosts.length - globalIndex).padStart(3, '0')}
                    </span>
                    <time
                      dateTime={post.date}
                      className="font-mono text-[10px] text-text-dim tabular-nums"
                    >
                      {fd(post.date)}
                    </time>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link
                        href={`/journal?tag=${encodeURIComponent(post.tag)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[9px] font-medium px-2 py-0.5 uppercase tracking-widest transition-all"
                        style={{
                          background: palette.bg,
                          border: `1px solid ${palette.border}`,
                          color: palette.accent,
                          borderRadius: '2px',
                        }}
                      >
                        {post.tag}
                      </Link>
                      {globalIndex === 0 && (
                        <span
                          className="font-mono text-[9px] font-bold px-2 py-0.5 text-black uppercase tracking-widest bg-construx"
                          style={{ borderRadius: '2px' }}
                        >
                          NEW
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-text-dim">{post.author}</span>
                      <span className="text-text-dim text-xs opacity-50">·</span>
                      <span className="font-mono text-[10px] text-text-dim">{post.readingTime} min read</span>
                    </div>
                    <h2 className="text-sm font-bold text-text-base group-hover:text-white transition-colors mb-1 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="flex-shrink-0 text-text-dim group-hover:text-text-muted group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
