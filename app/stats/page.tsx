import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPostMeta } from '@/lib/posts';
import { ventures } from '@/lib/ventures';
import BuildOutputPanel from '@/components/BuildOutputPanel';
import CurlHeadersPanel from '@/components/CurlHeadersPanel';

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

function bar(filled: number, total: number, width = 20): string {
  const n = Math.round((filled / total) * width);
  return '█'.repeat(n) + '░'.repeat(width - n);
}

export default function StatsPage() {
  const allPosts = getAllPostMeta();
  const totalPosts = allPosts.length;
  const totalReadTime = allPosts.reduce((sum, p) => sum + p.readingTime, 0);
  const avgReadTime = totalPosts > 0 ? (totalReadTime / totalPosts).toFixed(1) : '0';
  const estWords = totalReadTime * 200;

  const tagCounts: Record<string, number> = {};
  for (const post of allPosts) {
    tagCounts[post.tag] = (tagCounts[post.tag] ?? 0) + 1;
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const monthCounts: Record<string, number> = {};
  for (const post of allPosts) {
    if (!post.date) continue;
    const ym = post.date.slice(0, 7);
    monthCounts[ym] = (monthCounts[ym] ?? 0) + 1;
  }
  const sortedMonths = Object.entries(monthCounts).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  const maxMonthCount = Math.max(...Object.values(monthCounts), 1);
  const peakMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];

  const newestPost = allPosts[0];
  const oldestPost = allPosts[allPosts.length - 1];

  const buildDate = new Date().toISOString();
  const buildStamp = buildDate.slice(0, 19).replace('T', ' ') + 'Z';

  // Velocity: posts per week over the last 8 weeks
  const now = new Date();
  const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);
  const recentPosts = allPosts.filter(p => p.date && new Date(p.date) >= eightWeeksAgo);
  const velocityPerWeek = (recentPosts.length / 8).toFixed(1);

  // Longest post
  const longestPost = allPosts.reduce((a, b) => (b.readingTime > a.readingTime ? b : a), allPosts[0]);

  // Authors
  const authorCounts: Record<string, number> = {};
  for (const post of allPosts) {
    const a = post.author ?? 'Unknown';
    authorCounts[a] = (authorCounts[a] ?? 0) + 1;
  }

  const TAG_COLORS: Record<string, string> = {
    Strategy:    '#F97316',
    'Build Log': '#4ade80',
    Product:     '#7dd3fc',
    Methodology: '#a78bfa',
    Process:     '#67e8f9',
  };

  return (
    <div className="min-h-screen px-4 pt-28 pb-20 mx-auto max-w-3xl">
      {/* Back link — outside terminal */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors mb-6 uppercase tracking-widest"
      >
        ← HOME
      </Link>

      {/* macOS terminal window */}
      <div
        style={{
          background: 'rgba(1,1,10,0.97)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.025)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.5)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
          </div>
          <span className="font-mono text-[9px] text-text-dim tracking-wide flex-1 text-center">
            construx@sys — construx-stats — bash
          </span>
          <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.12)' }}>120×40</span>
        </div>

        {/* Terminal body */}
        <div
          className="font-mono overflow-x-auto"
          style={{
            padding: '20px 24px 28px',
            fontSize: '12px',
            lineHeight: '1.8',
            color: 'rgba(240,239,255,0.65)',
          }}
        >
          {/* Shell prompt */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@sys</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>:~$ </span>
            <span style={{ color: 'rgba(240,239,255,0.4)' }}>cat /var/construx/stats.json | jq .</span>
          </div>

          {/* Header comment */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'rgba(249,115,22,0.9)' }}>{'// CONSTRUX.SYSTEM.STATS'}</p>
            <p style={{ color: 'rgba(240,239,255,0.2)' }}>{'// GENERATED: ' + buildStamp}</p>
            <p style={{ color: 'rgba(240,239,255,0.2)' }}>{'// ENV: PRODUCTION · NODE: v22.2.0 · NEXT: 15.3.3'}</p>
          </div>

          {/* JOURNAL block */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'rgba(249,115,22,0.65)', marginBottom: '6px' }}>JOURNAL {'{'}</p>
            <div style={{ paddingLeft: '20px', borderLeft: '1px solid rgba(249,115,22,0.12)' }}>
              {[
                ['DISPATCHES   ', pad(String(totalPosts), 3), '#F97316'],
                ['EST_WORDS    ', estWords.toLocaleString(), null],
                ['TOTAL_READ   ', `${totalReadTime}m`, null],
                ['AVG_READ     ', `${avgReadTime}m / dispatch`, null],
                ['VELOCITY     ', `${velocityPerWeek} dispatches/wk (trailing 8w)`, null],
                ['PEAK_MONTH   ', `${peakMonth?.[0] ?? '—'} (${peakMonth?.[1] ?? 0} dispatches)`, 'rgba(103,232,249,0.8)'],
              ].map(([label, value, color]) => (
                <p key={label as string}>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>{label}</span>
                  <span style={{ color: color ?? 'rgba(240,239,255,0.7)' }}>{value}</span>
                </p>
              ))}
              {newestPost && (
                <p>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>LATEST       </span>
                  <Link
                    href={`/journal/${newestPost.slug}`}
                    style={{ color: 'rgba(249,115,22,0.75)', textDecoration: 'underline', textDecorationColor: 'rgba(249,115,22,0.3)' }}
                  >
                    {newestPost.title.slice(0, 44)}{newestPost.title.length > 44 ? '…' : ''}
                  </Link>
                </p>
              )}
              {longestPost && (
                <p>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>LONGEST      </span>
                  <Link
                    href={`/journal/${longestPost.slug}`}
                    style={{ color: 'rgba(240,239,255,0.55)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {longestPost.title.slice(0, 40)}{longestPost.title.length > 40 ? '…' : ''} ({longestPost.readingTime}m)
                  </Link>
                </p>
              )}
              {oldestPost && (
                <p>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>FIRST        </span>
                  <Link
                    href={`/journal/${oldestPost.slug}`}
                    style={{ color: 'rgba(240,239,255,0.35)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {oldestPost.title.slice(0, 44)}{oldestPost.title.length > 44 ? '…' : ''}
                  </Link>
                </p>
              )}
            </div>
            <p style={{ color: 'rgba(249,115,22,0.65)' }}>{'}'}</p>
          </div>

          {/* CATEGORY block */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'rgba(249,115,22,0.65)', marginBottom: '6px' }}>CATEGORY_DISTRIBUTION {'{'}</p>
            <div style={{ paddingLeft: '20px', borderLeft: '1px solid rgba(249,115,22,0.12)' }}>
              {sortedTags.map(([tag, count]) => (
                <p key={tag}>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>{padEnd(tag.toUpperCase(), 14)}</span>
                  <span style={{ color: `${TAG_COLORS[tag] ?? '#F97316'}88`, letterSpacing: '-1px' }}>
                    {bar(count, totalPosts)}{' '}
                  </span>
                  <span style={{ color: TAG_COLORS[tag] ?? 'rgba(240,239,255,0.7)', opacity: 0.8 }}>
                    {pad(String(count), 2)}
                  </span>
                  <span style={{ color: 'rgba(240,239,255,0.2)' }}>
                    {' '}({((count / totalPosts) * 100).toFixed(0)}%)
                  </span>
                </p>
              ))}
            </div>
            <p style={{ color: 'rgba(249,115,22,0.65)' }}>{'}'}</p>
          </div>

          {/* BY MONTH block */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'rgba(249,115,22,0.65)', marginBottom: '6px' }}>MONTHLY_ACTIVITY {'{'}</p>
            <div style={{ paddingLeft: '20px', borderLeft: '1px solid rgba(249,115,22,0.12)' }}>
              {sortedMonths.map(([ym, count]) => (
                <p key={ym}>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>{padEnd(ym, 12)}</span>
                  <span style={{ color: 'rgba(249,115,22,0.4)', letterSpacing: '-1px' }}>
                    {bar(count, maxMonthCount, 12)}{' '}
                  </span>
                  <span style={{ color: 'rgba(240,239,255,0.65)' }}>{pad(String(count), 2)} dispatches</span>
                </p>
              ))}
            </div>
            <p style={{ color: 'rgba(249,115,22,0.65)' }}>{'}'}</p>
          </div>

          {/* AUTHORS block */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'rgba(249,115,22,0.65)', marginBottom: '6px' }}>AUTHORS {'{'}</p>
            <div style={{ paddingLeft: '20px', borderLeft: '1px solid rgba(249,115,22,0.12)' }}>
              {Object.entries(authorCounts).map(([author, count]) => (
                <p key={author}>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>{padEnd(author.toUpperCase(), 22)}</span>
                  <span style={{ color: 'rgba(240,239,255,0.65)' }}>{pad(String(count), 3)} dispatches</span>
                </p>
              ))}
            </div>
            <p style={{ color: 'rgba(249,115,22,0.65)' }}>{'}'}</p>
          </div>

          {/* VENTURES block */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'rgba(249,115,22,0.65)', marginBottom: '6px' }}>VENTURES {'{'}</p>
            <div style={{ paddingLeft: '20px', borderLeft: '1px solid rgba(249,115,22,0.12)' }}>
              {ventures.map((v) => (
                <p key={v.id}>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>{padEnd(v.name.toUpperCase(), 20)}</span>
                  <span style={{ color: v.status === 'live' ? 'rgba(74,222,128,0.85)' : 'rgba(234,179,8,0.85)' }}>
                    {v.status.toUpperCase().padEnd(8)}
                  </span>
                  <span style={{ color: 'rgba(240,239,255,0.22)' }}>{v.category}</span>
                </p>
              ))}
            </div>
            <p style={{ color: 'rgba(249,115,22,0.65)' }}>{'}'}</p>
          </div>

          {/* STACK block */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'rgba(249,115,22,0.65)', marginBottom: '6px' }}>STACK {'{'}</p>
            <div style={{ paddingLeft: '20px', borderLeft: '1px solid rgba(249,115,22,0.12)' }}>
              {[
                ['FRAMEWORK ', 'Next.js 15 App Router'],
                ['RUNTIME   ', 'React 19 + TypeScript'],
                ['STYLING   ', 'Tailwind CSS 3'],
                ['AI        ', 'Claude (Anthropic API)'],
                ['3D        ', 'Three.js + React Three Fiber'],
                ['CONTENT   ', 'MDX via next-mdx-remote'],
                ['HOSTING   ', 'AWS Amplify'],
                ['ANALYTICS ', 'PostHog'],
                ['FONTS     ', 'Space Grotesk + JetBrains Mono'],
              ].map(([key, val]) => (
                <p key={key as string}>
                  <span style={{ color: 'rgba(240,239,255,0.3)' }}>{key}</span>
                  <span style={{ color: 'rgba(240,239,255,0.65)' }}>{val}</span>
                </p>
              ))}
            </div>
            <p style={{ color: 'rgba(249,115,22,0.65)' }}>{'}'}</p>
          </div>

          {/* Shell prompt + EOF */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ color: 'rgba(240,239,255,0.15)' }}>{'// EOF'}</p>
            <p style={{ marginTop: '10px' }}>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@sys</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>:~$ </span>
              <Link
                href="/journal"
                style={{ color: 'rgba(249,115,22,0.6)' }}
                className="hover:text-construx transition-colors"
              >
                {'→ READ THE JOURNAL'}
              </Link>
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 14px',
            background: 'rgba(249,115,22,0.07)',
            borderTop: '1px solid rgba(249,115,22,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(74,222,128,0.7)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="status-blink w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#4ade80' }} />
              LIVE
            </span>
            <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>
              {totalPosts} ENTRIES
            </span>
            <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>
              3 VENTURES
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.15)' }}>UTF-8</span>
            <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(249,115,22,0.45)' }}>construx@sys</span>
          </div>
        </div>
      </div>

      {/* Build output panel */}
      <div className="mt-6">
        <BuildOutputPanel />
      </div>

      {/* HTTP response headers panel */}
      <div className="mt-6">
        <CurlHeadersPanel />
      </div>
    </div>
  );
}
