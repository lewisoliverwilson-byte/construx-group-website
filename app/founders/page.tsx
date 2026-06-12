import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { ventures } from '@/lib/ventures';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Founders',
  description: 'The team behind Construx Group.',
};

export default function FoundersPage() {
  const allPosts = getAllPostMeta();
  const liveVentures = ventures.filter(v => v.status === 'live');

  return (
    <div className="min-h-screen pt-36 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-20">
          <p className="t-eyebrow mb-5">Founders</p>
          <h1 className="t-page">The team.</h1>
        </div>

        {/* Founder card */}
        <div className="relative card overflow-hidden mb-14">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 50% 80% at 0% 0%, rgba(139,92,246,0.06), transparent 60%)',
            }}
          />
          <div className="relative flex flex-col md:flex-row gap-10 p-9 md:p-12">
            {/* Left: identity */}
            <div className="flex-shrink-0 md:w-60">
              <div
                className="h-20 w-20 mb-6 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="font-display text-[24px] text-white/65" style={{ fontWeight: 700 }}>
                  LW
                </span>
              </div>
              <h2
                className="font-display text-[24px] text-white/90 leading-tight mb-1.5"
                style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                Lewis Wilson
              </h2>
              <p className="t-meta mb-6">Founder &amp; Builder</p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com"
                className="btn-text t-meta"
                style={{ fontSize: 10 }}
              >
                Direct line <ArrowUpRight size={10} />
              </a>
            </div>

            {/* Right: bio */}
            <div className="flex-1 space-y-5">
              <p className="t-lead text-[15.5px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Construx Group is a solo founder operation. I build every product in the
                portfolio — design, engineering, product, and strategy. The team is small
                by design: less coordination, more execution.
              </p>
              <p className="t-body text-[14.5px]">
                My background is in software engineering and product. I&apos;ve been
                building with AI since the early Claude models became accessible for
                production use, and I pivoted everything toward AI-native products when
                it became clear this wasn&apos;t a tool upgrade — it was a platform shift.
              </p>
              <p className="t-body text-[14.5px]">
                I operate from the UK. Every product in this portfolio is live, real, and
                built from scratch. Nothing is outsourced, nothing is templated, and
                nothing ships unless it meets a standard I&apos;d be comfortable
                defending.
              </p>

              {/* Venture credits */}
              <div className="pt-5 border-t border-border">
                <p className="t-eyebrow mb-4" style={{ fontSize: 9 }}>Built</p>
                <div className="flex flex-wrap gap-2">
                  {liveVentures.map((v) => (
                    <Link
                      key={v.id}
                      href={`/ventures/${v.slug}`}
                      className="flex items-center gap-2 text-[12px] font-light px-3.5 py-2 rounded-lg transition-all hover:-translate-y-px"
                      style={{
                        background: `${v.accent}0a`,
                        border: `1px solid ${v.accent}24`,
                        color: `${v.accent}d8`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: v.accent, boxShadow: `0 0 5px ${v.accent}80` }}
                      />
                      {v.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team growth */}
        <div className="card p-9 mb-14">
          <h3 className="t-card text-[20px] mb-4">The team grows slowly.</h3>
          <p className="t-body max-w-2xl mb-6">
            When Construx Group adds team members, it&apos;s for roles with complete
            ownership of a domain, not support roles. If you&apos;re the kind of person
            who builds things end-to-end and cares about quality, there may eventually be
            a conversation worth having.
          </p>
          <Link href="/work-with-us" className="btn-text t-meta" style={{ fontSize: 10 }}>
            Work with us <ArrowRight size={11} />
          </Link>
        </div>

        {/* Writing */}
        {allPosts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="t-eyebrow">Writing</p>
              <Link href="/journal" className="btn-text t-meta" style={{ fontSize: 10 }}>
                All posts <ArrowRight size={10} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPosts.slice(0, 4).map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group card card-hover px-6 py-5"
                >
                  <p className="t-meta mb-3" style={{ fontSize: 9 }}>{formatDate(post.date)}</p>
                  <p className="t-card text-[14.5px] leading-snug group-hover:text-white transition-colors">
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
