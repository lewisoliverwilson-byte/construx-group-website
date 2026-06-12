import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { ventures } from '@/lib/ventures';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Studio',
  description: 'The people and the method behind Construx Group.',
};

export default function FoundersPage() {
  const allPosts = getAllPostMeta();
  const liveVentures = ventures.filter(v => v.status === 'live');

  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Studio</p>
          <h1 className="t-page mb-7">One engineer.<br />One build engine.</h1>
          <p className="t-lead" style={{ maxWidth: '50ch' }}>
            Construx Group is a deliberately small studio. Here&apos;s who&apos;s
            behind it and how the work gets done.
          </p>
        </div>

        <div className="title-rule mb-16" />

        {/* Founder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-4">
            <p className="t-eyebrow mb-6" style={{ fontSize: 9.5 }}>Founder</p>
            <h2
              className="font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-none mb-3"
              style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}
            >
              Lewis Wilson
            </h2>
            <p className="t-meta mb-7">Founder &amp; Engineer · United Kingdom</p>
            <a
              href="mailto:lewis.oliver.wilson@googlemail.com"
              className="btn-text"
            >
              Direct line <ArrowUpRight size={10} />
            </a>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <p className="t-lead" style={{ color: '#46443e' }}>
              I build everything in the portfolio — design, engineering, product, and
              strategy. The studio is small by design: less coordination, more
              execution.
            </p>
            <p className="t-body">
              My background is software engineering and product. I&apos;ve been
              building with AI since the early Claude models became viable for
              production work, and restructured everything around AI-native
              development when it became clear this was a platform shift, not a tool
              upgrade.
            </p>
            <p className="t-body">
              Everything on the manifest is live, real, and built from scratch.
              Nothing outsourced, nothing templated, and nothing ships unless it meets
              a standard I&apos;d be comfortable defending.
            </p>

            {/* Built */}
            <div className="pt-6">
              <p className="t-eyebrow mb-4" style={{ fontSize: 9.5 }}>Built at the studio</p>
              <div className="flex flex-wrap gap-2">
                {liveVentures.map((v) => (
                  <Link
                    key={v.id}
                    href={`/ventures/${v.slug}`}
                    className="inline-flex items-center gap-2.5 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors hover:border-[#16181A]"
                    style={{
                      border: '1px solid var(--hairline)',
                      borderRadius: 2,
                      color: 'var(--ink-muted)',
                      background: 'var(--paper-raised)',
                    }}
                  >
                    <span className="dot-live" style={{ width: 5, height: 5 }} />
                    {v.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* The other half of the team */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 pt-16 border-t" style={{ borderColor: 'var(--hairline)' }}>
          <div className="lg:col-span-4">
            <p className="t-eyebrow mb-6" style={{ fontSize: 9.5 }}>Build engine</p>
            <h2
              className="font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-none mb-3"
              style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}
            >
              Claude
            </h2>
            <p className="t-meta">Anthropic · engineering colleague</p>
          </div>
          <div className="lg:col-span-8 space-y-5">
            <p className="t-body">
              The second member of the team isn&apos;t human. Claude writes most of
              the production code in this portfolio, operates the agent pipelines
              behind Construx Daily, and powers every product&apos;s AI capability.
              Treated as a colleague with real responsibilities — and reviewed like
              one.
            </p>
            <p className="t-body">
              This is the studio&apos;s thesis in practice: one experienced engineer
              directing machine-scale execution ships more, faster, and to a higher
              standard than a coordination-heavy team.
            </p>
          </div>
        </div>

        {/* Growth note */}
        <div className="sheet p-8 mb-20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="t-card text-[17px] mb-2">The team grows slowly.</p>
            <p className="t-body text-[14px]" style={{ maxWidth: '52ch' }}>
              When the studio adds people, it&apos;s for complete ownership of a
              domain — not support roles. Exceptional builders can always start a
              conversation.
            </p>
          </div>
          <Link href="/work-with-us" className="btn-line flex-shrink-0">
            Work with us
          </Link>
        </div>

        {/* Writing */}
        {allPosts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="t-eyebrow">Recent writing</p>
              <Link href="/journal" className="btn-text">
                All entries <ArrowRight size={10} />
              </Link>
            </div>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-px border-t border-b"
              style={{ background: 'var(--hairline)', borderColor: 'var(--hairline)' }}
            >
              {allPosts.slice(0, 4).map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group p-6"
                  style={{ background: 'var(--paper)' }}
                >
                  <p className="t-meta mb-3" style={{ fontSize: 9.5 }}>{formatDate(post.date)}</p>
                  <p
                    className="t-card text-[15px] leading-snug group-hover:underline"
                    style={{ textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
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
