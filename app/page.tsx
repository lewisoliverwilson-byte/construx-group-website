import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';
import CompanyHero from '@/components/CompanyHero';
import SolarSystemHero from '@/components/SolarSystemHero';

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
  'the-marqet': '/screenshots/the-marqet.png',
  'the-hyve': '/screenshots/the-hyve.png',
  'construx-daily': '/screenshots/construx-daily.png',
  'construx-studio': '/screenshots/construx-studio.png',
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

      {/* ── Hero: company identity ── */}
      <CompanyHero />

      {/* ── Venture Map: 3D solar system ── */}
      <SolarSystemHero />

      {/* ── Ventures ── */}
      <section id="ventures" className="relative py-32 px-6 lg:px-10 border-t border-border">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="flex items-end justify-between mb-24">
            <div>
              <p className="t-eyebrow mb-4">Portfolio</p>
              <h2 className="t-section">
                Five ventures.
                <br />
                All live.
              </h2>
            </div>
            <Link href="/ventures" className="hidden md:inline-flex btn-text t-meta" style={{ fontSize: 10 }}>
              Full portfolio <ArrowRight size={12} />
            </Link>
          </div>

          {/* Venture rows */}
          <div className="space-y-32">
            {ventures.map((v, i) => {
              const screenshot = SCREENSHOTS[v.slug] ?? null;
              const isEven = i % 2 === 0;

              const info = (
                <div className="flex flex-col justify-center py-4">
                  {/* Index + category */}
                  <div className="flex items-center gap-3 mb-7">
                    <span className="font-mono text-[11px] tabular-nums" style={{ color: v.accent, opacity: 0.75 }}>
                      0{i + 1}
                    </span>
                    <span className="h-px w-9" style={{ background: v.accent, opacity: 0.35 }} />
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.24em]"
                      style={{ color: v.accent }}
                    >
                      {v.category}
                    </span>
                  </div>

                  {/* Name */}
                  <h3
                    className="font-display leading-none mb-4 text-white/[0.93]"
                    style={{
                      fontWeight: 700,
                      fontSize: 'clamp(2.3rem, 3.6vw, 3.4rem)',
                      letterSpacing: '-0.028em',
                    }}
                  >
                    {v.name}
                  </h3>

                  {/* Tagline */}
                  <p
                    className="text-[17px] font-light mb-5"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    {v.tagline}
                  </p>

                  {/* Pitch excerpt */}
                  <p className="t-body mb-9" style={{ maxWidth: '46ch' }}>
                    {v.what}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2.5 mb-9">
                    {v.stats.slice(0, 3).map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-col gap-1 px-4 py-3 rounded-lg"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <span
                          className="font-display text-[15px]"
                          style={{ fontWeight: 600, color: v.accent }}
                        >
                          {s.value}
                        </span>
                        <span className="t-meta" style={{ fontSize: 8 }}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-6">
                    {v.url ? (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12.5px] font-normal transition-all duration-200 hover:-translate-y-px"
                        style={{
                          color: '#000008',
                          background: v.accent,
                          boxShadow: `0 4px 24px ${v.accent}30`,
                        }}
                      >
                        Visit {v.name} <ArrowUpRight size={12} />
                      </a>
                    ) : null}
                    <Link
                      href={`/ventures/${v.slug}`}
                      className="btn-text text-[13px]"
                    >
                      Learn more <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );

              const preview = (
                <div className="relative group">
                  {/* Accent glow behind frame */}
                  <div
                    className="absolute -inset-4 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${v.accent}14, transparent 70%)`,
                    }}
                  />
                  <div
                    className="relative rounded-xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-1"
                    style={{
                      border: '1px solid rgba(255,255,255,0.09)',
                      boxShadow: '0 24px 80px -24px rgba(0,0,0,0.8)',
                    }}
                  >
                    {/* Browser chrome */}
                    <div
                      className="flex items-center gap-2 px-4 py-2.5"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                      <div
                        className="flex-1 mx-3 h-5 rounded flex items-center px-2.5"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <span className="font-mono text-[9px] text-white/20 truncate">
                          {v.url ? v.url.replace('https://', '') : `construxgroup.io/${v.slug}`}
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
                            className="font-display leading-none text-center"
                            style={{
                              fontWeight: 700,
                              fontSize: 'clamp(2.8rem, 5vw, 5rem)',
                              letterSpacing: '-0.03em',
                              color: v.accent,
                              opacity: 0.18,
                            }}
                          >
                            {v.name}
                          </span>
                          <div className="w-12 h-px" style={{ background: v.accent, opacity: 0.2 }} />
                          <span className="t-meta" style={{ fontSize: 9 }}>Live</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <div
                  key={v.id}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
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
      <section className="relative py-32 px-6 lg:px-10 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="t-eyebrow mb-4">About</p>
              <h2 className="t-section mb-7">
                Built at the
                <br />
                AI frontier.
              </h2>
              <p className="t-lead max-w-lg mb-8">
                Construx Group is a portfolio of AI-first ventures built by a small team
                operating at the frontier of what AI makes possible. We don&apos;t add AI to
                existing ideas — we start with what AI enables and build backwards.
              </p>
              <Link href="/manifesto" className="btn-text">
                Read the manifesto <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-3 lg:pt-16">
              {[
                {
                  num: '01',
                  label: 'AI-native from day one',
                  desc: 'Every product is designed around AI capabilities, not bolted on afterwards.',
                },
                {
                  num: '02',
                  label: 'Small team, high output',
                  desc: 'We stay small and move fast. Every member owns their domain completely.',
                },
                {
                  num: '03',
                  label: 'Proper engineering',
                  desc: 'Production-grade code, real architecture, built to last.',
                },
                {
                  num: '04',
                  label: 'Frontier-first',
                  desc: "We track what's possible with the latest models and ship before the window closes.",
                },
              ].map(({ num, label, desc }) => (
                <div key={label} className="card card-hover px-6 py-5 flex gap-5">
                  <span className="font-mono text-[10px] text-white/20 tabular-nums pt-1">{num}</span>
                  <div>
                    <p className="t-card text-[15px] mb-1.5">{label}</p>
                    <p className="t-body text-[13px]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Journal ── */}
      {recentPosts.length > 0 && (
        <section className="relative py-32 px-6 lg:px-10 border-t border-border">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="t-eyebrow mb-4">Journal</p>
                <h2 className="t-section" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                  From the team.
                </h2>
              </div>
              <Link href="/journal" className="hidden md:inline-flex btn-text t-meta" style={{ fontSize: 10 }}>
                All {allPosts.length} posts <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group card card-hover p-7 flex flex-col"
                >
                  <p className="t-meta mb-4" style={{ fontSize: 9 }}>{post.date}</p>
                  <h3 className="t-card text-[17px] leading-snug mb-3 group-hover:text-white transition-colors">
                    {post.title}
                  </h3>
                  <p className="t-body text-[13px] line-clamp-2 mb-6">{post.excerpt}</p>
                  <div className="mt-auto flex items-center gap-1.5 t-meta group-hover:text-white/50 transition-colors" style={{ fontSize: 9 }}>
                    Read <ArrowRight size={10} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="relative py-36 px-6 lg:px-10 border-t border-border overflow-hidden">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 55% 60% at 50% 110%, rgba(139,92,246,0.08) 0%, transparent 65%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="t-eyebrow mb-6">Work with us</p>
          <h2 className="t-section mb-7" style={{ fontSize: 'clamp(2.6rem, 5vw, 4.4rem)' }}>
            Building something
            <br />
            serious?
          </h2>
          <p className="t-lead max-w-md mx-auto mb-11">
            We work with a small number of builders who share our standards. If
            that&apos;s you, let&apos;s talk.
          </p>
          <div className="flex items-center justify-center gap-5">
            <Link href="/work-with-us" className="btn-primary">
              Work with us
            </Link>
            <Link href="/contact" className="btn-text">
              Get in touch <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
