import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate as fd } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Build-in-public posts and insight pieces from Construx Group. The honest record of what we build and how.',
};

export default function JournalPage() {
  const posts = getAllPostMeta();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4 animate-fade-in">
            // BUILD IN PUBLIC
          </p>
          <h1 className="text-display text-text-base mb-5 leading-none animate-fade-up"
            style={{ animationDelay: '90ms' }}>
            The <span className="text-gradient-orange">Journal</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-lg animate-fade-up"
            style={{ animationDelay: '220ms' }}>
            The honest record of what we're building, how we're building it,
            and what AI at the frontier actually looks like in practice.
          </p>
          {posts.length > 0 && (() => {
            const tags = [...new Set(posts.map((p) => p.tag))].sort();
            return (
              <>
                <div className="flex items-center gap-4 mt-6 animate-fade-up" style={{ animationDelay: '350ms' }}>
                  <span className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-construx opacity-70" />
                    {String(posts.length).padStart(3, '0')} DISPATCHES
                  </span>
                  <span className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em]">
                    SIGNAL: LIVE
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 animate-fade-up" style={{ animationDelay: '440ms' }}>
                  {tags.map((tag) => {
                    const count = posts.filter((p) => p.tag === tag).length;
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 font-mono text-[9px] font-medium px-2.5 py-1 text-text-dim uppercase tracking-widest"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}
                      >
                        {tag}
                        <span className="text-construx/60">{count}</span>
                      </span>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Posts */}
      <section className="px-5 py-20 mx-auto max-w-3xl">
        {posts.length === 0 ? (
          <div
            className="px-8 py-12 text-center"
            style={{ background: 'rgba(5,5,18,0.5)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '3px' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-dim">SIGNAL PENDING — FIRST POST INCOMING</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/journal/${post.slug}`}
                className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7 px-6 py-5 transition-all hover:bg-subtle border border-transparent hover:border-construx/20${i % 2 === 0 ? ' bg-[rgba(5,5,18,0.6)]' : ''}`}
                style={{ borderRadius: '3px' }}
              >
                <div className="flex items-center gap-4 flex-shrink-0 sm:w-44">
                  <span className="font-mono text-[9px] text-construx/40 tabular-nums w-6 text-right flex-shrink-0">
                    #{String(posts.length - i).padStart(3, '0')}
                  </span>
                  <time
                    dateTime={post.date}
                    className="font-mono text-[10px] text-text-dim tabular-nums"
                  >
                    {fd(post.date)}
                  </time>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest"
                      style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '2px' }}
                    >
                      {post.tag}
                    </span>
                    <span className="font-mono text-[10px] text-text-dim">{post.author}</span>
                    <span className="text-text-dim text-xs opacity-50">·</span>
                    <span className="font-mono text-[10px] text-text-dim">{post.readingTime} min read</span>
                  </div>
                  <h2 className="text-sm font-bold text-text-base group-hover:text-text-base transition-colors mb-1 leading-snug">
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
