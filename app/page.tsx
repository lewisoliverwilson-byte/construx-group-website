import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import SolarSystemLoader from '@/components/solar-system/SolarSystemLoader';
import CountUp from '@/components/ui/CountUp';
import SystemLog from '@/components/SystemLog';
import SysBootSequence from '@/components/SysBootSequence';

export const metadata: Metadata = {
  title: 'Construx Group — AI-First Ventures',
  description:
    'A portfolio of AI-first ventures. We build the things that are only possible now that AI exists.',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Construx Group',
  description: 'A portfolio of AI-first ventures built by a small team operating at the frontier of what AI makes possible.',
  url: 'https://construxgroup.io',
  logo: 'https://construxgroup.io/icon',
  sameAs: [],
};

export default function HomePage() {
  const allPosts = getAllPostMeta();
  const recentPosts = allPosts.slice(0, 3);
  const now = new Date();
  const buildStamp = `BUILD.${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
  const postCount = String(allPosts.length).padStart(3, '0');
  const launchDate = new Date('2026-03-01');
  const uptimeDays = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
  const uptimeHours = Math.floor(((now.getTime() - launchDate.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const uptimeStamp = `UPTIME: ${String(uptimeDays).padStart(3, '0')}D ${String(uptimeHours).padStart(2, '0')}H`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* Hero: solar system */}
      <section className="relative" aria-label="Interactive venture explorer">
        {/* SSR headline — always indexed by crawlers */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none px-5">
          <div className="text-center max-w-3xl">
            <p className="font-mono text-[10px] font-medium tracking-[0.3em] uppercase text-construx mb-5 animate-fade-in">
              // CONSTRUX.GROUP
            </p>
            <h1 className="text-display text-gradient-white mb-4 animate-fade-up"
              style={{ animationDelay: '90ms' }}>
              Building at the<br />
              <span className="text-gradient-orange">AI frontier</span>
            </h1>
            <p className="text-base text-text-muted max-w-md mx-auto leading-relaxed animate-fade-up"
              style={{ animationDelay: '240ms' }}>
              A portfolio of ventures that only exist because AI makes them possible.
            </p>
            {/* Mobile-only status strip */}
            <div className="lg:hidden flex items-center justify-center gap-5 mt-5 animate-fade-up" style={{ animationDelay: '380ms' }}>
              <span className="font-mono text-[9px] text-construx/70 flex items-center gap-1.5 uppercase tracking-widest">
                <span className="inline-block w-1 h-1 rounded-full bg-construx animate-glow-pulse" />
                ONLINE
              </span>
              <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
                {ventures.length} VENTURES
              </span>
              <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
                {postCount} POSTS
              </span>
            </div>
          </div>
        </div>

        {/* HUD telemetry overlays */}
        <div className="absolute inset-0 z-[5] pointer-events-none select-none hidden lg:block">
          {/* Top-left: sys status */}
          <div className="absolute top-8 left-8 flex flex-col gap-1.5 opacity-50">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-construx" />
              SYS.STATUS: ONLINE
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              ACTIVE.VENTURES: 003
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              JOURNAL.POSTS: {postCount}
            </p>
          </div>
          {/* Top-right: build ref */}
          <div className="absolute top-8 right-8 flex flex-col items-end gap-1.5 opacity-50">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              {buildStamp}
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              AI.FRONTIER — LIVE
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest tabular-nums">
              {uptimeStamp}
            </p>
          </div>
          {/* Bottom-left: venture status */}
          <div className="absolute bottom-28 left-8 flex flex-col gap-1.5 opacity-50">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mb-0.5">
              // FLEET.STATUS
            </p>
            {ventures.map((v) => (
              <p key={v.id} className="font-mono text-[9px] text-text-dim uppercase tracking-widest flex items-center gap-1.5 tabular-nums">
                <span className="inline-block w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: v.accent }} />
                {v.name.toUpperCase().replace(' ', '.')}: NOMINAL
              </p>
            ))}
          </div>
          {/* Bottom-right: signal */}
          <div className="absolute bottom-28 right-8 flex flex-col items-end gap-1.5 opacity-50">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              SIGNAL: LOCKED
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              COORD: 51.5074°N / 0.1278°W
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[5] pointer-events-none select-none flex flex-col items-center gap-1.5 opacity-40">
          <span className="font-mono text-[8px] text-text-dim uppercase tracking-[0.3em]">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-dim to-transparent" />
        </div>

        <SolarSystemLoader />
      </section>

      {/* Boot sequence */}
      <div className="py-10">
        <SysBootSequence />
      </div>

      {/* Below-fold: What is Construx */}
      <section className="relative py-28 px-5 grid-bg overflow-hidden" aria-labelledby="what-construx">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-4">
                // WHAT WE ARE
              </p>
              <h2 id="what-construx" className="text-display-sm text-text-base mb-6 leading-tight">
                Not an agency.<br />
                Not a fund.<br />
                <span className="text-gradient-orange">A builder.</span>
              </h2>
              <p className="text-text-muted leading-relaxed mb-5">
                Construx Group is the parent of a growing portfolio of AI-first software ventures.
                We don't consult from the sideline — we build and own the products we ship.
              </p>
              <p className="text-text-muted leading-relaxed mb-8">
                Claude and Anthropic's tooling are our primary instrument. The result is a small team
                with the output of a much larger one — and products that simply weren't possible to
                build before now.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/manifesto"
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] uppercase tracking-wider"
                  style={{ borderRadius: '3px' }}
                >
                  Read the manifesto <ArrowRight size={15} />
                </Link>
                <Link
                  href="/work-with-us"
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all uppercase tracking-wider"
                  style={{ borderRadius: '3px' }}
                >
                  Work with us
                </Link>
                <Link
                  href="/journal"
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-medium text-text-dim hover:text-construx transition-all uppercase tracking-wider"
                >
                  Journal <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Venture grid */}
            <div className="flex flex-col gap-3">
              {ventures.map((v, i) => (
                <Link
                  key={v.id}
                  href={`/ventures/${v.slug}`}
                  className="group relative flex items-center gap-4 px-5 py-4 transition-all duration-200 bg-[rgba(5,5,18,0.6)] hover:bg-subtle"
                  style={{
                    border: `1px solid ${v.accent}18`,
                    borderRadius: '3px',
                  }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}cc, ${v.accent}44)`,
                      boxShadow: `0 0 16px ${v.accent}44`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-text-base">{v.name}</span>
                      <StatusBadge status={v.status} />
                    </div>
                    <p className="text-xs text-text-muted truncate mb-1.5">{v.tagline}</p>
                    <div className="flex flex-wrap gap-1">
                      {v.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-[8px] px-1.5 py-0.5 uppercase tracking-wider transition-colors duration-150"
                          style={{
                            background: `${v.accent}0d`,
                            border: `1px solid ${v.accent}1a`,
                            color: `${v.accent}88`,
                            borderRadius: '2px',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="flex-shrink-0 text-text-dim group-hover:text-text-muted group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              ))}
              <div
                className="flex items-center gap-4 px-5 py-4"
                style={{ background: 'rgba(5,5,18,0.35)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '3px' }}
              >
                <div className="flex -space-x-1.5">
                  {[0.3, 0.2, 0.12].map((o, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border border-border"
                      style={{ background: `rgba(255,255,255,${o})` }}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest">More ventures in incubation</p>
                  <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest opacity-60">Entering orbit soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip — HUD terminal panel */}
      <section className="px-5 py-8" aria-label="Key facts" style={{ background: 'rgba(3,3,14,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-5xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}>
          {/* Terminal header */}
          <div
            className="flex items-center gap-3 px-4 py-2 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,8,0.5)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-dim/40 flex-1">
              construx.metrics — portfolio.overview
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.45)' }}>
              ● LIVE
            </span>
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { node: <CountUp to={3} pad={3} />, label: 'Live ventures', key: 'ventures' },
              { node: <CountUp to={167} suffix="+" />, label: 'Marketplace listings', key: 'listings' },
              { node: <span>&lt;5s</span>, label: 'Avg. scan time', key: 'scan' },
              { node: <CountUp to={2} pad={3} />, label: 'Founders', key: 'founders' },
            ].map(({ node, label, key }, i) => (
              <div
                key={key}
                className="text-center py-8 px-4"
                style={{
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <p className="font-mono text-heading-xl font-bold text-gradient-orange mb-1">{node}</p>
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-[0.2em]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent journal posts */}
      {recentPosts.length > 0 && (
        <section className="py-20 px-5 mx-auto max-w-5xl" aria-labelledby="journal-heading">
          <div className="flex items-center justify-between mb-6">
            <h2
              id="journal-heading"
              className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim"
            >
              // FROM THE JOURNAL
            </h2>
            <Link
              href="/journal"
              className="font-mono text-[10px] text-construx hover:text-orange-400 transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              All {allPosts.length} posts <ArrowRight size={11} />
            </Link>
          </div>

          {/* Featured latest dispatch */}
          <Link
            href={`/journal/${recentPosts[0].slug}`}
            className="group relative block mb-1 overflow-hidden transition-all border border-construx/15 hover:border-construx/30"
            style={{ borderRadius: '3px', background: 'rgba(249,115,22,0.04)' }}
          >
            {/* Terminal title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 select-none"
              style={{ borderBottom: '1px solid rgba(249,115,22,0.12)', background: 'rgba(249,115,22,0.03)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-construx/50 flex-1">
                journal.latest — {recentPosts[0].tag.toLowerCase()}
              </span>
              <span className="font-mono text-[9px] text-text-dim">{recentPosts[0].readingTime} min</span>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[9px] text-construx/50 tracking-widest uppercase">LATEST DISPATCH</span>
                <span
                  className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest"
                  style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '2px' }}
                >
                  {recentPosts[0].tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-text-base group-hover:text-white transition-colors mb-2 leading-snug">
                {recentPosts[0].title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed line-clamp-2 mb-4">
                {recentPosts[0].excerpt}
              </p>
              <div className="flex items-center gap-2 font-mono text-[10px] text-construx group-hover:text-orange-400 transition-colors">
                Read dispatch <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Other recent posts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {recentPosts.slice(1).map((post, idx) => (
              <Link
                key={post.slug}
                href={`/journal/${post.slug}`}
                className="group flex flex-col overflow-hidden transition-all border border-transparent hover:border-construx/15"
                style={{ borderRadius: '3px', background: 'rgba(5,5,18,0.5)' }}
              >
                {/* Terminal title bar */}
                <div
                  className="flex items-center gap-2 px-3 py-2 flex-shrink-0 select-none"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
                >
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                    <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                    <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-construx/40 flex-1 truncate">
                    journal.recent — {post.tag.toLowerCase()}
                  </span>
                  <span className="font-mono text-[8px] text-text-dim/30 flex-shrink-0">{post.readingTime}m</span>
                </div>
                <div className="flex flex-col gap-2 px-4 py-4 flex-1">
                  <span
                    className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest self-start"
                    style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '2px' }}
                  >
                    {post.tag}
                  </span>
                  <p className="text-sm font-semibold text-text-muted group-hover:text-text-base transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </p>
                  <time dateTime={post.date} className="font-mono text-[10px] text-text-dim tabular-nums mt-auto">
                    {formatDate(post.date)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SystemLog posts={allPosts.slice(0, 8)} totalPosts={allPosts.length} />

      {/* CTA strip */}
      <section className="py-24 px-5" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-2xl">
          {/* Terminal window */}
          <div
            className="overflow-hidden"
            style={{
              background: 'rgba(3,3,14,0.97)',
              border: '1px solid rgba(249,115,22,0.18)',
              borderRadius: '6px',
              boxShadow: '0 0 60px rgba(249,115,22,0.07), 0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 select-none"
              style={{ borderBottom: '1px solid rgba(249,115,22,0.1)', background: 'rgba(249,115,22,0.025)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim/50 flex-1 text-center">
                construx.contact — handshake.init
              </span>
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
                ● READY
              </span>
            </div>

            {/* Body */}
            <div className="px-8 py-10">
              {/* Shell lines */}
              <div className="font-mono text-[11px] flex flex-col gap-1 mb-8">
                <div className="flex gap-3">
                  <span style={{ color: 'rgba(249,115,22,0.6)' }}>$</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>construx contact --intent=build --priority=high</span>
                </div>
                <div className="flex gap-3">
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>{'>'}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>Verifying AI stack alignment... OK</span>
                </div>
                <div className="flex gap-3">
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>{'>'}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>Checking venture capacity... OK</span>
                </div>
                <div className="flex gap-3">
                  <span style={{ color: 'rgba(74,222,128,0.6)' }}>✓</span>
                  <span style={{ color: 'rgba(74,222,128,0.85)' }}>Handshake ready. Awaiting contact.</span>
                </div>
              </div>

              {/* Headline */}
              <div className="text-center mb-6">
                <Zap className="mx-auto mb-4 text-construx animate-glow-pulse" size={24} />
                <h2 id="cta-heading" className="text-display-sm text-text-base mb-3">
                  Build with us.
                </h2>
                <p className="text-text-muted leading-relaxed max-w-md mx-auto">
                  If you need something built properly at the frontier of what AI can do,
                  we should talk.
                </p>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-mono text-sm font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-[1.02] uppercase tracking-wider"
                  style={{ borderRadius: '3px' }}
                >
                  Get in touch <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Status bar */}
            <div
              className="flex items-center justify-between px-4 py-1.5"
              style={{ borderTop: '1px solid rgba(249,115,22,0.08)', background: 'rgba(0,0,0,0.3)' }}
            >
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.35)' }}>
                construx@sys
              </span>
              <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>
                session:active
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
