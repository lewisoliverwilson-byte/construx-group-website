import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    "Dispatches from the Construx Group team — on building AI-first ventures, engineering decisions, and what we're learning.",
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
    <div className="min-h-screen pt-36 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="t-eyebrow mb-5">Journal</p>
            <h1 className="t-page mb-5">Dispatches.</h1>
            <p className="t-lead max-w-lg">
              Notes on building AI-first ventures — engineering decisions, product
              thinking, and what we&apos;re learning in real time.
            </p>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div>
              <p
                className="font-display text-[30px] text-white/85 leading-none"
                style={{ fontWeight: 700 }}
              >
                {allPosts.length}
              </p>
              <p className="t-meta mt-1" style={{ fontSize: 8.5 }}>Posts</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <a href="/feed.xml" className="btn-text t-meta" style={{ fontSize: 10 }}>
              RSS <ArrowUpRight size={11} />
            </a>
          </div>
        </div>

        {allPosts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="t-eyebrow mb-3">Coming soon</p>
            <p className="t-body">First dispatches publishing soon.</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <Link
                href={`/journal/${featured.slug}`}
                className="group relative block card overflow-hidden mb-14 transition-all duration-300 hover:border-white/[0.14]"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(139,92,246,0.07), transparent 60%)',
                  }}
                />
                <div className="relative p-9 lg:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                      style={{
                        color: 'rgba(167,139,250,0.9)',
                        background: 'rgba(139,92,246,0.09)',
                        border: '1px solid rgba(139,92,246,0.2)',
                      }}
                    >
                      Latest
                    </span>
                    <time dateTime={featured.date} className="t-meta">{formatDate(featured.date)}</time>
                    <span className="t-meta">·</span>
                    <span className="t-meta">{featured.readingTime} min read</span>
                  </div>
                  <h2
                    className="font-display text-white/90 group-hover:text-white transition-colors mb-4"
                    style={{
                      fontWeight: 700,
                      fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
                      lineHeight: 1.08,
                      letterSpacing: '-0.022em',
                      maxWidth: '24ch',
                    }}
                  >
                    {featured.title}
                  </h2>
                  <p className="t-lead text-[15px] max-w-2xl mb-7">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-2 t-meta group-hover:text-white/55 transition-colors">
                    Read dispatch <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            )}

            {/* Recent grid */}
            {recent.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
                {recent.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/journal/${post.slug}`}
                    className="group card card-hover p-6 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <time dateTime={post.date} className="t-meta" style={{ fontSize: 9 }}>
                        {formatDate(post.date)}
                      </time>
                      <span className="t-meta" style={{ fontSize: 9 }}>·</span>
                      <span className="t-meta" style={{ fontSize: 9 }}>{post.readingTime} min</span>
                    </div>
                    <h3 className="t-card text-[15.5px] leading-snug mb-3 group-hover:text-white transition-colors">
                      {post.title}
                    </h3>
                    <p className="t-body text-[12.5px] line-clamp-2 mb-5">{post.excerpt}</p>
                    {post.tag && (
                      <span className="mt-auto t-meta" style={{ fontSize: 8.5 }}>{post.tag}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Archive by year */}
            {years.map((year) => (
              <section key={year} className="mb-14">
                <div className="flex items-center gap-5 mb-6">
                  <h2
                    className="font-display text-[20px] text-white/55"
                    style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
                  >
                    {year}
                  </h2>
                  <div className="flex-1 hairline" />
                  <span className="t-meta" style={{ fontSize: 9 }}>
                    {byYear.get(year)!.length} posts
                  </span>
                </div>
                <div>
                  {byYear.get(year)!.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/journal/${post.slug}`}
                      className="group flex items-baseline gap-5 py-2.5 px-3 -mx-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      <time
                        dateTime={post.date}
                        className="t-meta flex-shrink-0 w-14 tabular-nums"
                        style={{ fontSize: 9.5 }}
                      >
                        {formatDate(post.date).replace(`, ${year}`, '').replace(` ${year}`, '')}
                      </time>
                      <span className="text-[14px] text-white/55 group-hover:text-white/90 transition-colors font-light leading-snug flex-1 min-w-0 truncate">
                        {post.title}
                      </span>
                      {post.tag && (
                        <span className="t-meta hidden md:block flex-shrink-0" style={{ fontSize: 8.5 }}>
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
