import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';
import VentureHero from '@/components/ventures/VentureHero';

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
};

export default function HomePage() {
  const allPosts = getAllPostMeta();
  const recentPosts = allPosts.slice(0, 3);
  const liveVentures = ventures.filter(v => v.status === 'live');
  const devVentures = ventures.filter(v => v.status === 'dev');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* ── Hero: 3D venture explorer ── */}
      <VentureHero />

      {/* ── Portfolio section ── */}
      <section className="relative py-28 px-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-3">Portfolio</p>
              <h2
                className="text-[clamp(2rem,4vw,3.2rem)] text-white/90 leading-[0.94]"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                Five ventures.<br />One mission.
              </h2>
            </div>
            <Link
              href="/ventures"
              className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/70 transition-colors"
            >
              All ventures <ArrowRight size={12} />
            </Link>
          </div>

          {/* Live ventures */}
          <div className="mb-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/22 mb-5">
              Live &mdash; {liveVentures.length}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveVentures.map((v, i) => (
                <a
                  key={v.id}
                  href={v.url ?? `/ventures/${v.slug}`}
                  target={v.url ? '_blank' : undefined}
                  rel={v.url ? 'noopener noreferrer' : undefined}
                  className="group relative glass rounded-lg p-6 hover:-translate-y-1 transition-all duration-300"
                  style={{
                    borderTop: `2px solid ${v.accent}`,
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: v.accent }}>
                      {v.category}
                    </p>
                    {v.url && (
                      <ArrowUpRight
                        size={13}
                        className="text-white/20 group-hover:text-white/50 transition-colors"
                      />
                    )}
                  </div>
                  <h3
                    className="text-[22px] text-white/88 mb-2 leading-[1.0]"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.015em' }}
                  >
                    {v.name}
                  </h3>
                  <p className="text-[13px] text-white/40 font-light leading-relaxed mb-5">
                    {v.tagline}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {v.stats.slice(0, 4).map((s) => (
                      <div key={s.label} className="bg-white/[0.03] rounded px-2.5 py-2 border border-white/[0.05]">
                        <p className="font-mono text-[8px] text-white/22 uppercase tracking-wider mb-0.5">{s.label}</p>
                        <p
                          className="text-[14px] font-semibold"
                          style={{ fontFamily: 'Clash Display, system-ui, sans-serif', color: v.accent }}
                        >
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Dev ventures */}
          <div className="mt-10">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/22 mb-5">
              In Development &mdash; {devVentures.length}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devVentures.map((v) => (
                <div
                  key={v.id}
                  className="glass rounded-lg p-6"
                  style={{ borderTop: `2px solid ${v.accent}`, opacity: 0.72 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: v.accent }}>
                      {v.category}
                    </p>
                    <span
                      className="font-mono text-[8px] uppercase tracking-[0.14em] px-2 py-1 rounded-sm"
                      style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      In Development
                    </span>
                  </div>
                  <h3
                    className="text-[22px] text-white/75 mb-2 leading-[1.0]"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.015em' }}
                  >
                    {v.name}
                  </h3>
                  <p className="text-[13px] text-white/35 font-light leading-relaxed">
                    {v.tagline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About section ── */}
      <section className="py-24 px-5 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">About</p>
              <h2
                className="text-[clamp(2.2rem,4.5vw,3.8rem)] text-white/90 leading-[0.92] mb-6"
                style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.025em' }}
              >
                Built at the<br />AI frontier.
              </h2>
              <p className="text-[15px] text-white/45 font-light leading-relaxed max-w-lg">
                Construx Group is a portfolio of AI-first ventures built by a small team operating at the frontier of what AI makes possible. We don't add AI to existing ideas. We start with what AI enables and build backwards.
              </p>
            </div>
            <div className="space-y-4 lg:pt-12">
              {[
                { label: 'AI-native from day one', desc: 'Every product is designed around AI capabilities, not bolted on afterwards.' },
                { label: 'Small team, high output', desc: 'We stay small and move fast. Every member owns their domain completely.' },
                { label: 'Proper engineering', desc: 'Production-grade code, real architecture, things built to last.' },
                { label: 'Frontier-first', desc: 'We track what\'s possible with the latest models and ship before the window closes.' },
              ].map(({ label, desc }, i) => (
                <div
                  key={label}
                  className="glass rounded-md px-5 py-4"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <p
                    className="text-[14px] text-white/78 mb-1"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                  >
                    {label}
                  </p>
                  <p className="text-[13px] text-white/35 font-light">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Journal section ── */}
      {recentPosts.length > 0 && (
        <section className="py-24 px-5 lg:px-8 border-t border-border">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-3">Journal</p>
                <h2
                  className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-white/90 leading-[0.94]"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
                >
                  From the team.
                </h2>
              </div>
              <Link
                href="/journal"
                className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/70 transition-colors"
              >
                All posts <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPosts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group glass rounded-lg p-6 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22 mb-3">
                    {post.date}
                  </p>
                  <h3
                    className="text-[17px] text-white/82 leading-snug mb-3 group-hover:text-white/95 transition-colors"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600, letterSpacing: '-0.01em' }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-[12px] text-white/30 font-light line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 font-mono text-[9px] text-white/22 group-hover:text-white/50 transition-colors uppercase tracking-wider">
                    Read <ArrowRight size={10} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 px-5 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-5">Work With Us</p>
          <h2
            className="text-[clamp(2.4rem,5vw,4.2rem)] text-white/90 leading-[0.92] mb-6"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.025em' }}
          >
            Building something<br />serious?
          </h2>
          <p className="text-[15px] text-white/40 font-light max-w-md mx-auto leading-relaxed mb-10">
            We work with a small number of builders who share our standards. If that's you, let's talk.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/work-with-us"
              className="px-8 py-3.5 glass rounded text-[13px] text-white/80 hover:text-white border border-white/10 hover:border-white/20 transition-all font-light tracking-wide"
            >
              Work With Us
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 text-[13px] text-white/45 hover:text-white/70 transition-colors font-light tracking-wide flex items-center gap-2"
            >
              Get in touch <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
