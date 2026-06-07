import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate as fd } from '@/lib/utils';
import ActivityHistogram from '@/components/journal/ActivityHistogram';
import JournalStats from '@/components/journal/JournalStats';
import DispatchCalendar from '@/components/journal/DispatchCalendar';
import DispatchGitLog from '@/components/journal/DispatchGitLog';
import JournalWcPanel from '@/components/JournalWcPanel';
import TechFreqPanel from '@/components/TechFreqPanel';
import SitemapIndexPanel from '@/components/SitemapIndexPanel';
import RssFeedPanel from '@/components/RssFeedPanel';
import HttpArchivePanel from '@/components/HttpArchivePanel';
import WebVitalsPanel from '@/components/WebVitalsPanel';
import GitBlamePanel from '@/components/GitBlamePanel';
import GhCliPanel from '@/components/GhCliPanel';
import AwsCliPanel from '@/components/AwsCliPanel';
import TrivyScanPanel from '@/components/TrivyScanPanel';
import DbMigrationPanel from '@/components/DbMigrationPanel';
import BunBuildPanel from '@/components/BunBuildPanel';
import SbomPanel from '@/components/SbomPanel';
import NatsPubSubPanel from '@/components/NatsPubSubPanel';
import SentryIssuesPanel from '@/components/SentryIssuesPanel';
import PgvectorPanel from '@/components/PgvectorPanel';
import MeilisearchPanel from '@/components/MeilisearchPanel';

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

  const dateCounts: Record<string, number> = {};
  allPosts.forEach((p) => {
    dateCounts[p.date] = (dateCounts[p.date] ?? 0) + 1;
  });

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
          {!activeTag && <DispatchCalendar dateCounts={dateCounts} />}

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

          {/* Git commit log */}
          {!activeTag && (
            <DispatchGitLog posts={allPosts} total={allPosts.length} />
          )}
        </div>
      </section>

      {/* Word count analysis */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <JournalWcPanel />
      </section>

      {/* Tech term frequency */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <TechFreqPanel />
      </section>

      {/* Sitemap index */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SitemapIndexPanel />
      </section>

      {/* RSS feed */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <RssFeedPanel />
      </section>

      {/* HTTP archive / request waterfall */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <HttpArchivePanel />
      </section>

      {/* Core Web Vitals */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <WebVitalsPanel />
      </section>

      {/* Git blame — source authorship */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <GitBlamePanel />
      </section>

      {/* GitHub CLI — org repos, PRs, issues */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <GhCliPanel />
      </section>

      {/* AWS CLI — Amplify apps, S3, CloudWatch */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <AwsCliPanel />
      </section>

      {/* Trivy container vulnerability scan */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <TrivyScanPanel />
      </section>

      {/* Drizzle migration status */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DbMigrationPanel />
      </section>

      {/* Bun build output */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BunBuildPanel />
      </section>

      {/* SBOM — software bill of materials */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SbomPanel />
      </section>

      {/* NATS pub/sub message stream */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <NatsPubSubPanel />
      </section>

      {/* Sentry error tracking issues */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SentryIssuesPanel />
      </section>

      {/* pgvector semantic search */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <PgvectorPanel />
      </section>

      {/* Meilisearch full-text search */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <MeilisearchPanel />
      </section>

      {/* Posts */}
      <section className="px-5 py-20 mx-auto max-w-3xl">
        <div
          className="overflow-hidden"
          style={{
            background: 'rgba(3,3,14,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '4px',
          }}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-dim/40 flex-1 text-center">
              construx.journal — dispatch.log
            </span>
            <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(249,115,22,0.4)' }}>
              {String(posts.length).padStart(3, '0')}
            </span>
          </div>
          {/* Shell prompt */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <span className="font-mono text-[10px]" style={{ color: 'rgba(249,115,22,0.5)' }}>construx@sys:~$</span>
              <span className="font-mono text-[10px] ml-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {activeTag
                  ? `journal --filter tag="${activeTag}" --sort=date`
                  : 'journal --all --sort=date --limit=all'}
              </span>
            </div>
            {activeTag && (
              <Link
                href="/journal"
                className="font-mono text-[9px] text-construx hover:text-orange-400 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                <X size={9} /> CLEAR
              </Link>
            )}
          </div>
          {/* Post list */}
          {posts.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-dim">
                {activeTag ? `NO DISPATCHES TAGGED: ${activeTag}` : 'SIGNAL PENDING — FIRST POST INCOMING'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: '1px', background: 'rgba(255,255,255,0.03)' }}>
              {posts.map((post) => {
                const globalIndex = allPosts.findIndex((p) => p.slug === post.slug);
                const palette = TAG_PALETTE[post.tag] ?? DEFAULT_PALETTE;
                return (
                  <Link
                    key={post.slug}
                    href={`/journal/${post.slug}`}
                    className="group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7 px-6 py-5 transition-all hover:bg-subtle"
                    style={{
                      background: 'rgba(3,3,14,0.85)',
                      borderLeft: `2px solid ${palette.rowBorder}`,
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
          {/* Status footer */}
          <div
            className="flex items-center justify-between px-5 py-1.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
          >
            <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
              {String(posts.length).padStart(3, '0')} dispatches{activeTag ? ` / tag: ${activeTag}` : ' / all'}
            </span>
            <span className="font-mono text-[8px] flex items-center gap-1.5" style={{ color: 'rgba(249,115,22,0.4)' }}>
              <span className="inline-block w-1 h-1 rounded-full bg-construx opacity-70" />
              SIGNAL: LIVE
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
