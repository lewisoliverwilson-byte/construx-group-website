import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'System Stats',
  description: 'Site statistics for Construx Group — post counts, reading times, category distribution.',
  robots: { index: false, follow: false },
};

function padEnd(str: string, len: number): string {
  return str.padEnd(len, ' ');
}

function pad(str: string, len: number): string {
  return String(str).padStart(len, '0');
}

export default function StatsPage() {
  const allPosts = getAllPostMeta();
  const totalPosts = allPosts.length;
  const totalReadTime = allPosts.reduce((sum, p) => sum + p.readingTime, 0);
  const avgReadTime = totalPosts > 0 ? (totalReadTime / totalPosts).toFixed(1) : '0';

  // Estimated word count: readingTime * 200 words/min
  const estWords = totalReadTime * 200;

  // By tag
  const tagCounts: Record<string, number> = {};
  for (const post of allPosts) {
    tagCounts[post.tag] = (tagCounts[post.tag] ?? 0) + 1;
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  // By month
  const monthCounts: Record<string, number> = {};
  for (const post of allPosts) {
    if (!post.date) continue;
    const ym = post.date.slice(0, 7);
    monthCounts[ym] = (monthCounts[ym] ?? 0) + 1;
  }
  const sortedMonths = Object.entries(monthCounts).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);

  const newestPost = allPosts[0];
  const oldestPost = allPosts[allPosts.length - 1];

  const buildDate = new Date().toISOString();
  const buildStamp = buildDate.slice(0, 19).replace('T', ' ') + 'Z';

  return (
    <div className="min-h-screen px-5 pt-36 pb-20 mx-auto max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors mb-12 group uppercase tracking-widest"
      >
        <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
        // HOME
      </Link>

      <div
        className="font-mono text-[12px] leading-relaxed"
        style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'rgba(240,239,255,0.7)' }}
      >
        {/* Header */}
        <div className="mb-8">
          <p style={{ color: 'rgba(249,115,22,0.9)' }}>// CONSTRUX.SYSTEM.STATS</p>
          <p style={{ color: 'rgba(240,239,255,0.25)' }}>// GENERATED: {buildStamp}</p>
          <p style={{ color: 'rgba(240,239,255,0.25)' }}>// ENV: PRODUCTION</p>
        </div>

        {/* Journal overview */}
        <div className="mb-8">
          <p className="mb-3" style={{ color: 'rgba(249,115,22,0.6)' }}>JOURNAL</p>
          <div className="space-y-1 pl-4" style={{ borderLeft: '1px solid rgba(249,115,22,0.15)' }}>
            <p>
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd('DISPATCHES', 22)}</span>
              <span style={{ color: '#F97316' }}>{pad(String(totalPosts), 3)}</span>
            </p>
            <p>
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd('EST. WORDS', 22)}</span>
              <span style={{ color: 'rgba(240,239,255,0.7)' }}>{estWords.toLocaleString()}</span>
            </p>
            <p>
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd('TOTAL READ TIME', 22)}</span>
              <span style={{ color: 'rgba(240,239,255,0.7)' }}>{totalReadTime} MIN</span>
            </p>
            <p>
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd('AVG READ TIME', 22)}</span>
              <span style={{ color: 'rgba(240,239,255,0.7)' }}>{avgReadTime} MIN</span>
            </p>
            {newestPost && (
              <p>
                <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd('LATEST', 22)}</span>
                <Link
                  href={`/journal/${newestPost.slug}`}
                  className="hover:text-construx transition-colors underline underline-offset-2"
                  style={{ color: 'rgba(240,239,255,0.7)', textDecorationColor: 'rgba(249,115,22,0.3)' }}
                >
                  {newestPost.title.slice(0, 40)}{newestPost.title.length > 40 ? '...' : ''}
                </Link>
              </p>
            )}
            {oldestPost && (
              <p>
                <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd('OLDEST', 22)}</span>
                <Link
                  href={`/journal/${oldestPost.slug}`}
                  className="hover:text-construx transition-colors underline underline-offset-2"
                  style={{ color: 'rgba(240,239,255,0.7)', textDecorationColor: 'rgba(249,115,22,0.3)' }}
                >
                  {oldestPost.title.slice(0, 40)}{oldestPost.title.length > 40 ? '...' : ''}
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* By category */}
        <div className="mb-8">
          <p className="mb-3" style={{ color: 'rgba(249,115,22,0.6)' }}>CATEGORY DISTRIBUTION</p>
          <div className="space-y-1 pl-4" style={{ borderLeft: '1px solid rgba(249,115,22,0.15)' }}>
            {sortedTags.map(([tag, count]) => {
              const barWidth = Math.round((count / totalPosts) * 20);
              const bar = '█'.repeat(barWidth) + '░'.repeat(20 - barWidth);
              return (
                <p key={tag}>
                  <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd(tag.toUpperCase(), 16)}</span>
                  <span style={{ color: 'rgba(249,115,22,0.5)', letterSpacing: '-1px' }}>{bar} </span>
                  <span style={{ color: 'rgba(240,239,255,0.7)' }}>{pad(String(count), 2)}</span>
                </p>
              );
            })}
          </div>
        </div>

        {/* By month */}
        <div className="mb-8">
          <p className="mb-3" style={{ color: 'rgba(249,115,22,0.6)' }}>BY MONTH</p>
          <div className="space-y-1 pl-4" style={{ borderLeft: '1px solid rgba(249,115,22,0.15)' }}>
            {sortedMonths.map(([ym, count]) => (
              <p key={ym}>
                <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd(ym, 16)}</span>
                <span style={{ color: 'rgba(240,239,255,0.7)' }}>{pad(String(count), 2)} DISPATCHES</span>
              </p>
            ))}
          </div>
        </div>

        {/* Ventures */}
        <div className="mb-8">
          <p className="mb-3" style={{ color: 'rgba(249,115,22,0.6)' }}>VENTURES</p>
          <div className="space-y-1 pl-4" style={{ borderLeft: '1px solid rgba(249,115,22,0.15)' }}>
            {ventures.map((v) => (
              <p key={v.id}>
                <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd(v.name.toUpperCase(), 22)}</span>
                <span style={{ color: v.status === 'live' ? 'rgba(34,197,94,0.8)' : 'rgba(234,179,8,0.8)' }}>
                  {v.status.toUpperCase()}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.25)' }}>  {v.category}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="mb-8">
          <p className="mb-3" style={{ color: 'rgba(249,115,22,0.6)' }}>STACK</p>
          <div className="space-y-1 pl-4" style={{ borderLeft: '1px solid rgba(249,115,22,0.15)' }}>
            {[
              ['FRAMEWORK', 'Next.js 15 App Router'],
              ['UI', 'React 19 + Tailwind CSS 3'],
              ['LANGUAGE', 'TypeScript'],
              ['AI', 'Claude (Anthropic)'],
              ['3D', 'Three.js + React Three Fiber'],
              ['CONTENT', 'MDX via next-mdx-remote'],
              ['HOSTING', 'AWS Amplify'],
              ['ANALYTICS', 'PostHog'],
              ['FONTS', 'Space Grotesk + JetBrains Mono'],
            ].map(([key, val]) => (
              <p key={key}>
                <span style={{ color: 'rgba(240,239,255,0.35)' }}>{padEnd(key, 22)}</span>
                <span style={{ color: 'rgba(240,239,255,0.7)' }}>{val}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: 'rgba(240,239,255,0.2)' }}>// EOF — CONSTRUX.SYSTEM.STATS</p>
          <p className="mt-2">
            <Link
              href="/journal"
              className="hover:text-construx transition-colors"
              style={{ color: 'rgba(249,115,22,0.5)' }}
            >
              → READ THE JOURNAL
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
