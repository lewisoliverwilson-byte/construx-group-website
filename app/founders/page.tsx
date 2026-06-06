import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Founders',
  description:
    'Lewis Wilson and Dan — the two people behind Construx Group. How they met, why they started building, and how the group operates.',
};

const founders = [
  {
    name: 'Lewis Wilson',
    handle: 'LW',
    role: 'Co-founder',
    bio: `Builder and product architect. Leads the technical direction for every venture in the portfolio — from architecture decisions to the prompt engineering that sits at the core of each product.\n\nCame up in full-stack web development before AI made it interesting to build in a completely different way. Now spends most of his time proving that a two-person team with the right tools can build what previously took ten.`,
    focus: ['Product strategy', 'Technical architecture', 'AI integration', 'Venture direction'],
    accent: '#F97316',
    stats: [
      { label: 'VENTURES', value: '003' },
      { label: 'BUILDS', value: '1k+' },
      { label: 'STACK', value: 'TS / Next.js' },
    ],
  },
  {
    name: 'Dan',
    handle: 'DAN',
    role: 'Co-founder',
    bio: `Operator and creative director. Turns half-formed ideas into something real, and real things into something people actually want to use.\n\nHandles the side of building that isn't code — the go-to-market framing, the product design decisions, the user experience decisions that determine whether a technically excellent product gets used or ignored.`,
    focus: ['Design', 'Operations', 'Product direction', 'Growth'],
    accent: '#8B5CF6',
    stats: [
      { label: 'VENTURES', value: '003' },
      { label: 'DESIGNS', value: '12+' },
      { label: 'DOMAIN', value: 'GTM / UX' },
    ],
  },
];

const foundersSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Founders — Construx Group',
  url: 'https://construxgroup.io/founders',
  mainEntity: founders.map((f) => ({
    '@type': 'Person',
    name: f.name,
    jobTitle: f.role,
    worksFor: { '@type': 'Organization', name: 'Construx Group', url: 'https://construxgroup.io' },
  })),
};

function pad(n: string, len: number) {
  return String(n).padEnd(len, ' ');
}

export default function FoundersPage() {
  const allPosts = getAllPostMeta();

  const now = new Date();
  const launchDate = new Date('2026-03-01');
  const tenure = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(foundersSchema) }}
      />
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-5 animate-fade-in">
            // THE PEOPLE
          </p>
          <h1
            className="text-display text-text-base mb-6 leading-none animate-fade-up"
            style={{ animationDelay: '90ms', animationFillMode: 'both' }}
          >
            The <span className="text-gradient-orange">Founders</span>
          </h1>
          <p
            className="text-text-muted text-base leading-relaxed max-w-lg mx-auto animate-fade-up"
            style={{ animationDelay: '220ms', animationFillMode: 'both' }}
          >
            Two people. Equal billing. Everything built, owned, and shipped together.
          </p>
        </div>
      </section>

      {/* Founder cards */}
      <section className="px-5 py-20 mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {founders.map((f) => (
            <article
              key={f.name}
              className="overflow-hidden"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${f.accent}20`,
                boxShadow: `0 0 40px ${f.accent}06`,
                borderRadius: '3px',
              }}
            >
              {/* Top gradient line */}
              <div
                className="h-px w-full"
                style={{ background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }}
              />

              <div className="p-8">
                {/* ID panel */}
                <div
                  className="mb-7 p-4 overflow-hidden"
                  style={{
                    background: 'rgba(0,0,6,0.7)',
                    border: `1px solid ${f.accent}18`,
                    borderRadius: '3px',
                    fontFamily: 'var(--font-jetbrains-mono)',
                  }}
                >
                  <p
                    className="text-[9px] font-medium uppercase tracking-[0.25em] mb-3"
                    style={{ color: `${f.accent}80` }}
                  >
                    // ID.PROFILE
                  </p>
                  <div className="space-y-1.5">
                    {[
                      ['USER', f.handle],
                      ['STATUS', '● ONLINE'],
                      ['ROLE', f.role.toUpperCase()],
                      ['TENURE', `${String(tenure).padStart(3, '0')}D`],
                      ['DISPATCHES', String(allPosts.length).padStart(3, '0')],
                      ...f.stats.map((s) => [s.label, s.value]),
                    ].map(([key, val]) => (
                      <p key={key} className="text-[9px] flex items-center">
                        <span style={{ color: 'rgba(255,255,255,0.22)', minWidth: '90px' }}>
                          {pad(key, 12)}
                        </span>
                        <span
                          style={{
                            color:
                              val === '● ONLINE'
                                ? '#4ade80'
                                : 'rgba(240,239,255,0.65)',
                          }}
                        >
                          {val}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Name + role */}
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-base mb-1">{f.name}</h2>
                    <p className="text-sm font-medium" style={{ color: f.accent }}>
                      {f.role}, Construx Group
                    </p>
                  </div>
                  {/* Pulsing status dot */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full animate-glow-pulse"
                      style={{ background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.8)' }}
                    />
                    <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#4ade80' }}>
                      Online
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-3 mb-7">
                  {f.bio.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-text-muted leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Focus areas */}
                <div>
                  <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-text-dim mb-3">
                    // FOCUS AREAS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {f.focus.map((area) => (
                      <span
                        key={area}
                        className="font-mono text-[9px] font-medium px-2.5 py-1 uppercase tracking-wider"
                        style={{
                          background: `${f.accent}10`,
                          border: `1px solid ${f.accent}20`,
                          color: f.accent,
                          borderRadius: '2px',
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Origin story */}
        <div
          className="mt-16 p-10"
          style={{
            background: 'rgba(5,5,18,0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '3px',
          }}
        >
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-text-dim mb-3">
            // ORIGIN
          </p>
          <h2 className="text-heading-xl text-text-base mb-6">How Construx started</h2>
          <p className="text-text-muted leading-relaxed text-base mb-4">
            Construx started from a simple observation: the tools had changed enough that a small,
            disciplined team could build and ship things that previously required significant
            headcount, funding, and time. The question wasn't whether AI could help — it was
            whether you could organise a company entirely around that assumption from day one.
          </p>
          <p className="text-text-muted leading-relaxed text-base mb-4">
            The first test was{' '}
            <Link
              href="/ventures/scoutr"
              className="text-construx hover:text-orange-400 underline underline-offset-2 decoration-construx/40 transition-colors"
            >
              Scoutr
            </Link>{' '}
            — a resell intelligence product built in three weeks, live in production, with real users
            before most startups have finished their pitch deck. That worked. So we kept going.{' '}
            <Link
              href="/ventures/the-marqet"
              className="text-construx hover:text-orange-400 underline underline-offset-2 decoration-construx/40 transition-colors"
            >
              The Marqet
            </Link>{' '}
            followed. Then{' '}
            <Link
              href="/ventures/the-hyve"
              className="text-construx hover:text-orange-400 underline underline-offset-2 decoration-construx/40 transition-colors"
            >
              The Hyve
            </Link>
            . Each venture was proof that the model held at the next level of complexity.
          </p>
          <p className="text-text-muted leading-relaxed text-base">
            Every product in the portfolio is something that wouldn't exist in its current form
            without Claude as a core collaborator — not a shortcut, but a genuine building tool.
            The result is a small group that operates like something much larger, without
            compromising on quality or pace.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            href="/work-with-us"
            className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            Work with us <ArrowRight size={14} />
          </Link>
          <Link
            href="/manifesto"
            className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            Read the manifesto
          </Link>
        </div>
      </section>
    </div>
  );
}
