import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'Founders',
  description: 'The team behind Construx Group.',
};

export default function FoundersPage() {
  const allPosts = getAllPostMeta();
  const liveVentures = ventures.filter(v => v.status === 'live');

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">

        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">Founders</p>
          <h1
            className="text-display text-white/90"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            The team.
          </h1>
        </div>

        {/* Founder card */}
        <div className="glass rounded-xl p-8 md:p-10 mb-12 border-t-2 border-white/12">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Left: identity */}
            <div className="flex-shrink-0 md:w-56">
              <div
                className="h-20 w-20 mb-5 rounded-lg flex items-center justify-center border border-white/10"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <span
                  className="text-[24px] text-white/60"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
                >
                  LW
                </span>
              </div>
              <h2
                className="text-[22px] text-white/88 leading-tight mb-1"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
              >
                Lewis Wilson
              </h2>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35 mb-5">
                Founder &amp; Builder
              </p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com"
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/28 hover:text-white/55 transition-colors flex items-center gap-1.5"
              >
                Direct line <ArrowUpRight size={10} />
              </a>
            </div>

            {/* Right: bio */}
            <div className="flex-1 space-y-4">
              <p className="text-[15px] text-white/52 font-light leading-relaxed">
                Construx Group is a solo founder operation. I build every product in the portfolio — design, engineering, product, and strategy. The team is small by design: less coordination, more execution.
              </p>
              <p className="text-[15px] text-white/52 font-light leading-relaxed">
                My background is in software engineering and product. I've been building with AI since the early Claude models became accessible for production use, and I pivoted everything toward AI-native products when it became clear this wasn't a tool upgrade — it was a platform shift.
              </p>
              <p className="text-[15px] text-white/52 font-light leading-relaxed">
                I operate from the UK. Every product in this portfolio is live, real, and built from scratch. Nothing is outsourced, nothing is templated, and nothing ships unless it meets a standard I'd be comfortable defending.
              </p>

              {/* Venture credits */}
              <div className="pt-4 border-t border-border">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/22 mb-3">Built</p>
                <div className="flex flex-wrap gap-2">
                  {liveVentures.map((v) => (
                    <span
                      key={v.id}
                      className="flex items-center gap-1.5 font-mono text-[9px] px-3 py-1.5 rounded-sm"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${v.accent}25`,
                        color: v.accent,
                      }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ background: v.accent }} />
                      {v.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What we're looking for */}
        <div className="mb-12 glass rounded-xl p-8 border-t-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h3
            className="text-[20px] text-white/82 mb-4"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            The team grows slowly.
          </h3>
          <p className="text-[14px] text-white/42 font-light leading-relaxed max-w-2xl mb-5">
            When Construx Group adds team members, it's for roles with complete ownership of a domain, not support roles. If you're the kind of person who builds things end-to-end and cares about quality, there may eventually be a conversation worth having.
          </p>
          <Link
            href="/work-with-us"
            className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35 hover:text-white/65 transition-colors"
          >
            Work with us <ArrowRight size={11} />
          </Link>
        </div>

        {/* Writing */}
        {allPosts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">Writing</p>
              <Link
                href="/journal"
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/22 hover:text-white/50 transition-colors"
              >
                All posts <ArrowRight size={10} className="inline ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allPosts.slice(0, 4).map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group glass rounded-md px-5 py-4 hover:-translate-y-0.5 transition-all"
                >
                  <p className="font-mono text-[8px] text-white/20 mb-2">{post.date}</p>
                  <p
                    className="text-[14px] text-white/65 group-hover:text-white/85 transition-colors leading-snug"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                  >
                    {post.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
