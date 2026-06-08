import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';
import CompanyHero from '@/components/CompanyHero';

export const metadata: Metadata = {
  title: 'Construx Group — AI-First Ventures',
  description:
    'A portfolio of AI-first ventures. We build the things that are only possible now that AI exists.',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Construx Group',
  description:
    'A portfolio of AI-first ventures built by a small team operating at the frontier of what AI makes possible.',
  url: 'https://construxgroup.io',
};

// Map venture slugs to their screenshot paths (add as sites go live)
const SCREENSHOTS: Record<string, string> = {
  scoutr: '/screenshots/scoutr.png',
};

export default function HomePage() {
  const allPosts = getAllPostMeta();
  const recentPosts = allPosts.slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* ── Hero ── */}
      <CompanyHero />

      {/* ── Ventures ── */}
      <section id="ventures" className="py-28 px-6 lg:px-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-7xl">

          {/* Section header */}
          <div className="flex items-end justify-between mb-20">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/25 mb-3">
                Portfolio
              </p>
              <h2
                className="text-white/90 leading-[0.93]"
                style={{
                  fontFamily: 'Clash Display, system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
                  letterSpacing: '-0.025em',
                }}
              >
                Five ventures.<br />All live.
              </h2>
            </div>
            <Link
              href="/ventures"
              className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 hover:text-white/65 transition-colors"
            >
              Full portfolio <ArrowRight size={12} />
            </Link>
          </div>

          {/* Venture rows — alternating layout */}
          <div className="space-y-24">
            {ventures.map((v, i) => {
              const screenshot = SCREENSHOTS[v.slug] ?? null;
              const isEven = i % 2 === 0;

              const info = (
                <div className="flex flex-col justify-center py-4">
                  {/* Number + category */}
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="font-mono text-[11px] tabular-nums"
                      style={{ color: v.accent, opacity: 0.7 }}
                    >
                      0{i + 1}
                    </span>
                    <span
                      className="h-px flex-1 max-w-[32px]"
                      style={{ background: v.accent, opacity: 0.3 }}
                    />
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.22em]"
                      style={{ color: v.accent }}
                    >
                      {v.category}
                    </span>
                  </div>

                  {/* Name */}
                  <h3
                    className="text-white/92 leading-none mb-3"
                    style={{
                      fontFamily: 'Clash Display, system-ui, sans-serif',
                      fontWeight: 700,
                      fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {v.name}
                  </h3>

                  {/* Tagline */}
                  <p
                    className="text-[15px] font-light leading-relaxed mb-8"
                    style={{ color: 'rgba(255,255,255,0.42)', maxWidth: '38ch' }}
                  >
                    {v.tagline}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {v.stats.slice(0, 3).map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center gap-2 px-3 py-2 rounded"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <span
                          className="font-mono text-[8px] uppercase tracking-wider"
                          style={{ color: 'rgba(255,255,255,0.25)' }}
                        >
                          {s.label}
                        </span>
                        <span
                          className="text-[13px] font-semibold"
                          style={{
                            fontFamily: 'Clash Display, system-ui, sans-serif',
                            color: v.accent,
                          }}
                        >
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-5">
                    {v.url ? (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors"
                        style={{ color: v.accent }}
                      >
                        Visit <ArrowUpRight size={11} />
                      </a>
                    ) : null}
                    <Link
                      href={`/ventures/${v.slug}`}
                      className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/28 hover:text-white/55 transition-colors"
                    >
                      Learn more <ArrowRight size={11} className="inline" />
                    </Link>
                  </div>
                </div>
              );

              const preview = (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* Browser chrome */}
                  <div
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div
                      className="flex-1 mx-3 h-5 rounded-sm flex items-center px-2.5"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <span className="font-mono text-[9px] text-white/18 truncate">
                        {v.url
                          ? v.url.replace('https://', '')
                          : `construxgroup.io/${v.slug}`}
                      </span>
                    </div>
                  </div>

                  {/* Screenshot or accent placeholder */}
                  <div className="relative" style={{ aspectRatio: '16/10' }}>
                    {screenshot ? (
                      <Image
                        src={screenshot}
                        alt={`${v.name} product screenshot`}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 55vw"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                        style={{ background: `${v.accent}09` }}
                      >
                        <span
                          className="font-mono text-[9px] uppercase tracking-[0.25em]"
                          style={{ color: v.accent, opacity: 0.5 }}
                        >
                          {v.category}
                        </span>
                        <span
                          className="leading-none text-center"
                          style={{
                            fontFamily: 'Clash Display, system-ui, sans-serif',
                            fontWeight: 700,
                            fontSize: 'clamp(2.8rem, 5vw, 5rem)',
                            letterSpacing: '-0.03em',
                            color: v.accent,
                            opacity: 0.18,
                          }}
                        >
                          {v.name}
                        </span>
                        <div
                          className="w-12 h-px"
                          style={{ background: v.accent, opacity: 0.2 }}
                        />
                        <span
                          className="font-mono text-[9px] uppercase tracking-[0.2em]"
                          style={{ color: 'rgba(255,255,255,0.18)' }}
                        >
                          Live
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );

              return (
                <div
                  key={v.id}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                >
                  {isEven ? (
                    <>
                      <div>{info}</div>
                      <div>{preview}</div>
                    </>
                  ) : (
                    <>
                      <div className="lg:order-2">{info}</div>
                      <div className="lg:order-1">{preview}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section
        className="py-28 px-6 lg:px-12 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/25 mb-4">
                About
              </p>
              <h2
                className="text-white/90 leading-[0.92] mb-6"
                style={{
                  fontFamily: 'Clash Display, system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
                  letterSpacing: '-0.028em',
                }}
              >
                Built at the<br />AI frontier.
              </h2>
              <p className="text-[15px] text-white/40 font-light leading-relaxed max-w-lg">
                Construx Group is a portfolio of AI-first ventures built by a small team operating
                at the frontier of what AI makes possible. We don't add AI to existing ideas — we
                start with what AI enables and build backwards.
              </p>
            </div>
            <div className="space-y-3 lg:pt-14">
              {[
                {
                  label: 'AI-native from day one',
                  desc: 'Every product is designed around AI capabilities, not bolted on afterwards.',
                },
                {
                  label: 'Small team, high output',
                  desc: 'We stay small and move fast. Every member owns their domain completely.',
                },
                {
                  label: 'Proper engineering',
                  desc: 'Production-grade code, real architecture, built to last.',
                },
                {
                  label: 'Frontier-first',
                  desc: "We track what's possible with the latest models and ship before the window closes.",
                },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  className="rounded-md px-5 py-4"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
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

      {/* ── Journal ── */}
      {recentPosts.length > 0 && (
        <section
          className="py-28 px-6 lg:px-12 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/25 mb-3">
                  Journal
                </p>
                <h2
                  className="text-white/90 leading-[0.93]"
                  style={{
                    fontFamily: 'Clash Display, system-ui, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  From the team.
                </h2>
              </div>
              <Link
                href="/journal"
                className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 hover:text-white/65 transition-colors"
              >
                All posts <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group rounded-lg p-6 hover:-translate-y-0.5 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22 mb-3">
                    {post.date}
                  </p>
                  <h3
                    className="text-[16px] text-white/72 leading-snug mb-3 group-hover:text-white/92 transition-colors"
                    style={{
                      fontFamily: 'Clash Display, system-ui, sans-serif',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
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
      <section
        className="py-28 px-6 lg:px-12 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/25 mb-5">
            Work with us
          </p>
          <h2
            className="text-white/90 leading-[0.92] mb-6"
            style={{
              fontFamily: 'Clash Display, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2.6rem, 5vw, 4.4rem)',
              letterSpacing: '-0.028em',
            }}
          >
            Building something<br />serious?
          </h2>
          <p className="text-[15px] text-white/38 font-light max-w-md mx-auto leading-relaxed mb-10">
            We work with a small number of builders who share our standards. If that's you, let's
            talk.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/work-with-us"
              className="px-8 py-3.5 rounded text-[13px] text-white/80 hover:text-white font-light tracking-wide transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Work with us
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 text-[13px] text-white/38 hover:text-white/65 transition-colors font-light tracking-wide flex items-center gap-2"
            >
              Get in touch <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
