import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'Founders',
  description: 'The two founders behind Construx Group — and the machine they direct.',
};

const FOUNDERS = [
  {
    num: '01',
    name: 'Lewis Wilson',
    initials: 'LW',
    role: 'Co-Founder · Engineering & Product',
    email: 'lewis.oliver.wilson@googlemail.com',
    bio: [
      'Lewis leads engineering and product across the portfolio — architecture, build, and deployment of every Construx project. He has been building with AI since the early Claude models became viable for production work, and restructured the studio around AI-native development when it became clear this was a platform shift, not a tool upgrade.',
      'Based in the UK. If it shipped from this studio, it passed through his hands.',
    ],
  },
  {
    num: '02',
    name: 'Daniel Boyd',
    initials: 'DB',
    role: 'Co-Founder',
    email: null,
    bio: [
      'Daniel is the second half of the founding team. Full profile coming soon — bio, focus areas, and the parts of the operation he runs.',
      'In the meantime: he exists, he builds, and the title block says BOYD for a reason.',
    ],
    placeholder: true,
  },
];

export default function FoundersPage() {
  const liveVentures = ventures.filter(v => v.status === 'live');

  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Founders</p>
          <h1 className="t-page mb-7">Two founders.<br />One machine.</h1>
          <p className="t-lead" style={{ maxWidth: '50ch' }}>
            Construx Group is run by two people directing machine-scale execution.
            Small by design: less coordination, more shipping.
          </p>
        </div>

        <div className="title-rule mb-0" />

        {/* Founder profiles */}
        {FOUNDERS.map(({ num, name, initials, role, email, bio, placeholder }) => (
          <div
            key={name}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-14 border-b"
            style={{ borderColor: 'var(--hairline)' }}
          >
            {/* Identity */}
            <div className="lg:col-span-4 flex gap-6">
              <span className="font-mono text-[12px] tabular-nums pt-2" style={{ color: 'var(--ink-faint)' }}>
                {num}
              </span>
              <div>
                <div
                  className="h-20 w-20 mb-6 flex items-center justify-center"
                  style={{
                    background: 'var(--paper-raised)',
                    border: '1.5px solid var(--ink)',
                    borderRadius: 2,
                  }}
                >
                  <span className="font-display text-[22px]" style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    {initials}
                  </span>
                </div>
                <h2
                  className="font-display text-[clamp(1.5rem,2.8vw,2.1rem)] leading-none mb-2.5"
                  style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}
                >
                  {name}
                </h2>
                <p className="t-meta mb-5">{role}</p>
                {email ? (
                  <a href={`mailto:${email}`} className="btn-text">
                    Direct line <ArrowUpRight size={10} />
                  </a>
                ) : (
                  <span className="pencil-note">profile being drafted —</span>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="lg:col-span-8 space-y-5 lg:pt-2">
              {bio.map((p) => (
                <p key={p.slice(0, 24)} className="t-body text-[15px]" style={{ maxWidth: '62ch' }}>
                  {p}
                </p>
              ))}
              {placeholder && (
                <div
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{
                    border: '1px dashed var(--ink-faint)',
                    borderRadius: 2,
                    color: 'var(--ink-muted)',
                  }}
                >
                  <span className="reg-mark" style={{ transform: 'scale(0.6)' }} />
                  Placeholder — full profile pending
                </div>
              )}
            </div>
          </div>
        ))}

        {/* The third member */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-14 border-b" style={{ borderColor: 'var(--hairline)' }}>
          <div className="lg:col-span-4 flex gap-6">
            <span className="font-mono text-[12px] tabular-nums pt-2" style={{ color: 'var(--ink-faint)' }}>
              03
            </span>
            <div>
              <h2
                className="font-display text-[clamp(1.5rem,2.8vw,2.1rem)] leading-none mb-2.5"
                style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}
              >
                Claude
              </h2>
              <p className="t-meta">Build Engine · Anthropic</p>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-5 lg:pt-2">
            <p className="t-body text-[15px]" style={{ maxWidth: '62ch' }}>
              The third member of the team isn&apos;t human. Claude writes most of the
              production code in this portfolio, runs the agent pipelines behind
              Construx Daily, and powers every product&apos;s AI capability. Treated
              as a colleague with real responsibilities — and reviewed like one.
            </p>
            <p className="pencil-note">— it also drew the machine on the homepage</p>
          </div>
        </div>

        {/* Built */}
        <div className="py-14">
          <p className="t-eyebrow mb-6">Built by this team</p>
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

        {/* CTA */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center gap-7" style={{ borderColor: 'var(--hairline)' }}>
          <Link href="/work-with-us" className="btn-text">
            Work with us <ArrowRight size={11} />
          </Link>
          <Link href="/manifesto" className="btn-text">
            How we build <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
