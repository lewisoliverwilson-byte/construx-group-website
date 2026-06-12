import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes from Construx Group — engineering decisions, product thinking, and what building with AI actually looks like.',
};

export default function BlogPage() {
  const allPosts = getAllPostMeta();
  const [featured, ...rest] = allPosts;

  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <p className="t-eyebrow mb-5">Blog</p>
            <h1 className="t-page mb-6">Notes from<br />the studio.</h1>
            <p className="t-lead" style={{ maxWidth: '46ch' }}>
              Engineering decisions, product thinking, and what building with AI
              actually looks like — written as we go.
            </p>
          </div>
          <div className="flex items-center gap-8 flex-shrink-0">
            <a href="/feed.xml" className="btn-text">
              RSS <ArrowUpRight size={11} />
            </a>
          </div>
        </div>

        <div className="title-rule mb-14" />

        {allPosts.length === 0 ? (
          /* Empty state — an unstarted sheet */
          <div className="relative py-24 flex flex-col items-center text-center">
            <span className="reg-mark mb-8" />
            <p
              className="font-display text-[clamp(1.4rem,2.8vw,2rem)] mb-4"
              style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}
            >
              A blank sheet, for now.
            </p>
            <p className="t-body mb-3" style={{ maxWidth: '44ch' }}>
              First posts are being drafted. In the meantime, the projects speak
              for themselves.
            </p>
            <p className="pencil-note mb-10">— the machines are writing as fast as they can</p>
            <div className="flex items-center gap-5">
              <Link href="/ventures" className="btn-ink">
                See the projects <ArrowRight size={12} />
              </Link>
              <Link href="/now" className="btn-text">
                What we&apos;re doing now <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block mb-16">
                <div className="flex items-center gap-4 mb-5">
                  <span className="reg-mark" style={{ transform: 'scale(0.8)' }} />
                  <span className="t-meta">
                    Latest · {formatDate(featured.date)} · {featured.readingTime} min
                  </span>
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

            {/* All posts */}
            <div className="border-t" style={{ borderColor: 'var(--hairline)' }}>
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex items-baseline gap-6 py-5 border-b"
                  style={{ borderColor: 'var(--hairline)' }}
                >
                  <time dateTime={post.date} className="t-meta flex-shrink-0 w-24 tabular-nums">
                    {formatDate(post.date)}
                  </time>
                  <span
                    className="font-serif-body text-[16px] leading-snug flex-1 min-w-0 transition-colors group-hover:underline"
                    style={{
                      color: 'var(--ink)',
                      textDecorationColor: 'var(--orange)',
                      textUnderlineOffset: 3,
                    }}
                  >
                    {post.title}
                  </span>
                  {post.tag && (
                    <span className="t-meta hidden md:block flex-shrink-0">{post.tag}</span>
                  )}
                  <ArrowRight size={13} className="flex-shrink-0" style={{ color: 'var(--ink-faint)' }} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
