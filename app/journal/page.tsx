import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Working notes from Construx Group — engineering decisions, product thinking, and what building with AI actually looks like.',
};

export default function JournalPage() {
  const allPosts = getAllPostMeta();
  const [featured, ...rest] = allPosts;
  const recent = rest.slice(0, 6);
  const archive = rest.slice(6);

  // Group archive by year
  const byYear = new Map<string, typeof archive>();
  for (const post of archive) {
    const year = String(new Date(post.date).getFullYear());
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(post);
  }
  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <p className="t-eyebrow mb-5">Journal</p>
            <h1 className="t-page mb-6">Working notes.</h1>
            <p className="t-lead" style={{ maxWidth: '46ch' }}>
              Engineering decisions, product thinking, and what building with AI
              actually looks like — written as we go.
            </p>
          </div>
          <div className="flex items-center gap-8 flex-shrink-0">
            <div>
              <p className="font-display text-[32px] leading-none" style={{ fontWeight: 600, color: 'var(--ink)' }}>
                {allPosts.length}
              </p>
              <p className="t-meta mt-1.5" style={{ fontSize: 9.5 }}>Entries</p>
            </div>
            <div className="w-px h-10" style={{ background: 'var(--hairline)' }} />
            <a href="/feed.xml" className="btn-text">
              RSS <ArrowUpRight size={11} />
            </a>
          </div>
        </div>

        <div className="title-rule mb-14" />

        {allPosts.length === 0 ? (
          <div className="sheet p-12 text-center">
            <p className="t-eyebrow mb-3">Coming soon</p>
            <p className="t-body">First entries publishing soon.</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <Link
                href={`/journal/${featured.slug}`}
                className="group block mb-16"
              >
                <div className="flex items-center gap-4 mb-5">
                  <span className="reg-mark" style={{ transform: 'scale(0.8)' }} />
                  <span className="t-meta">Latest · {formatDate(featured.date)} · {featured.readingTime} min</span>
                </div>
                <h2
                  className="font-display group-hover:underline mb-5"
                  style={{
                    fontWeight: 600,
                    fontSize: 'clamp(1.7rem,3.6vw,2.9rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.025em',
                    color: 'var(--ink)',
                    maxWidth: '26ch',
                    textDecorationColor: 'var(--orange)',
                    textUnderlineOffset: 6,
                  }}
                >
                  {featured.title}
                </h2>
                <p className="t-lead text-[16px]" style={{ maxWidth: '60ch' }}>{featured.excerpt}</p>
              </Link>
            )}

            {/* Recent grid */}
            {recent.length > 0 && (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px mb-20 border-t border-b"
                style={{ background: 'var(--hairline)', borderColor: 'var(--hairline)' }}
              >
                {recent.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/journal/${post.slug}`}
                    className="group flex flex-col p-7"
                    style={{ background: 'var(--paper)' }}
                  >
                    <p className="t-meta mb-4" style={{ fontSize: 9.5 }}>
                      {formatDate(post.date)} · {post.readingTime} min
                    </p>
                    <h3
                      className="t-card text-[16.5px] leading-snug mb-3 group-hover:underline"
                      style={{ textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
                    >
                      {post.title}
                    </h3>
                    <p className="t-body text-[13px] line-clamp-2">{post.excerpt}</p>
                  </Link>
                ))}
              </div>
            )}

            {/* Archive by year */}
            {years.map((year) => (
              <section key={year} className="mb-12">
                <div className="flex items-center gap-6 mb-5">
                  <h2 className="font-display text-[19px]" style={{ fontWeight: 600, color: 'var(--ink-muted)' }}>
                    {year}
                  </h2>
                  <div className="flex-1 hairline" />
                  <span className="t-meta" style={{ fontSize: 9.5 }}>
                    {byYear.get(year)!.length} entries
                  </span>
                </div>
                <div>
                  {byYear.get(year)!.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/journal/${post.slug}`}
                      className="group flex items-baseline gap-6 py-2.5 border-b transition-colors"
                      style={{ borderColor: 'transparent' }}
                    >
                      <time
                        dateTime={post.date}
                        className="t-meta flex-shrink-0 w-16 tabular-nums"
                        style={{ fontSize: 10 }}
                      >
                        {formatDate(post.date).replace(`, ${year}`, '').replace(` ${year}`, '')}
                      </time>
                      <span
                        className="font-serif-body text-[14.5px] leading-snug flex-1 min-w-0 truncate transition-colors group-hover:text-[#16181A] group-hover:underline"
                        style={{ color: 'var(--ink-muted)', textDecorationColor: 'var(--orange)', textUnderlineOffset: 3 }}
                      >
                        {post.title}
                      </span>
                      {post.tag && (
                        <span className="t-meta hidden md:block flex-shrink-0" style={{ fontSize: 9 }}>
                          {post.tag}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
