import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Dispatches from the Construx Group team — on building AI-first ventures, engineering decisions, and what we\'re learning.',
};

export default function JournalPage() {
  const allPosts = getAllPostMeta();

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">Journal</p>
          <h1
            className="text-display text-white/90 mb-4"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            Dispatches.
          </h1>
          <p className="text-[15px] text-white/40 font-light max-w-lg leading-relaxed">
            Notes on building AI-first ventures — engineering decisions, product thinking, and what we're learning in real time.
          </p>
        </div>

        {allPosts.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/22 mb-3">Coming soon</p>
            <p className="text-[14px] text-white/35 font-light">First dispatches publishing soon.</p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="flex items-center gap-6 mb-10 pb-6 border-b border-border">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22 mb-1">Total</p>
                <p
                  className="text-[26px] text-white/82"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
                >
                  {allPosts.length}
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22 mb-1">Latest</p>
                <p className="text-[13px] text-white/45 font-light">
                  {allPosts[0]?.date ?? '—'}
                </p>
              </div>
              <div className="ml-auto">
                <a
                  href="/feed.xml"
                  className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/22 hover:text-white/50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
                  RSS
                </a>
              </div>
            </div>

            {/* Posts list */}
            <div className="space-y-2">
              {allPosts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group flex flex-col md:flex-row md:items-start gap-4 py-5 px-5 rounded-lg hover:bg-white/[0.03] transition-colors -mx-5"
                >
                  <div className="flex-shrink-0 flex items-center gap-3 md:w-44">
                    <span className="font-mono text-[9px] text-white/18 tabular-nums w-7">
                      {String(allPosts.length - i).padStart(3, '0')}
                    </span>
                    <span className="font-mono text-[10px] text-white/25">
                      {post.date}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2
                      className="text-[16px] text-white/72 group-hover:text-white/92 transition-colors leading-snug mb-1.5"
                      style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600, letterSpacing: '-0.01em' }}
                    >
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[12.5px] text-white/30 font-light line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    {post.tag && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <span
                          className="font-mono text-[8px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' }}
                        >
                          {post.tag}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center md:pt-0.5">
                    <ArrowRight
                      size={14}
                      className="text-white/15 group-hover:text-white/40 transition-colors"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
