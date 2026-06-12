import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manifesto',
  description: 'How Construx Group builds. Operational principles, not aspirations.',
};

const PRINCIPLES = [
  {
    num: '01',
    title: 'Start with what AI enables',
    body: "We don't take an existing industry and ask how AI could improve it. We ask what becomes possible that wasn't possible before, and build that thing. The difference is everything.",
  },
  {
    num: '02',
    title: "Build properly or don't build",
    body: "Fast doesn't mean sloppy. We move quickly because our engineering is sound, not because we're skipping steps. Everything we ship is production-grade from day one.",
  },
  {
    num: '03',
    title: 'Small teams ship better software',
    body: "Coordination overhead is the enemy of good software. We keep the studio small, roles clear, and ownership complete. One person who cares beats ten who don't.",
  },
  {
    num: '04',
    title: 'Claude is a colleague, not a tool',
    body: "We don't use AI as a feature. We use it as infrastructure. The best things we've built treat Claude as a first-class member of the team with real responsibilities.",
  },
  {
    num: '05',
    title: 'The window matters',
    body: "AI capability is growing faster than most builders are exploiting it. That gap won't stay open forever. We move accordingly.",
  },
  {
    num: '06',
    title: 'Margins are the mission',
    body: 'Real businesses, real unit economics. Every project needs a sustainable model. Building at the frontier is not an excuse to ignore fundamentals.',
  },
];

export default function ManifestoPage() {
  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-20">
          <p className="t-eyebrow mb-5">Manifesto</p>
          <h1 className="t-page mb-7">How we build.</h1>
          <p className="t-lead" style={{ maxWidth: '50ch' }}>
            These principles govern every decision the studio makes. They are not
            aspirational. They are operational.
          </p>
        </div>

        {/* Pull quote */}
        <blockquote className="relative mb-20 pl-8 border-l-2" style={{ borderColor: 'var(--ink)' }}>
          <p
            className="font-display text-[clamp(1.4rem,3vw,2.2rem)] leading-[1.2]"
            style={{ fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}
          >
            We build the things that are only possible now that AI exists — and we
            build them properly.
          </p>
        </blockquote>

        <div className="title-rule mb-0" />

        {/* Principles */}
        <div className="mb-24">
          {PRINCIPLES.map((p) => (
            <div
              key={p.num}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 py-9 border-b"
              style={{ borderColor: 'var(--hairline)' }}
            >
              <span className="md:col-span-1 font-mono text-[12px] tabular-nums pt-1" style={{ color: 'var(--ink-faint)' }}>
                {p.num}
              </span>
              <h3 className="md:col-span-4 t-card text-[20px] leading-tight">{p.title}</h3>
              <p className="md:col-span-7 t-body" style={{ maxWidth: '58ch' }}>{p.body}</p>
            </div>
          ))}
        </div>

        {/* On Claude */}
        <div className="mb-20">
          <p className="t-eyebrow mb-4">On Claude</p>
          <h2 className="t-section mb-8">The build engine.</h2>
          <div className="space-y-5 t-body text-[15.5px]" style={{ maxWidth: '62ch', lineHeight: 1.78 }}>
            <p>
              Everything we ship is built on Anthropic&apos;s Claude. This is not a
              vendor preference — it&apos;s the studio&apos;s central bet. We tested
              everything. Claude wins on reasoning quality, instruction following, and
              the long-context work our products demand. When that changes, we&apos;ll
              change. It hasn&apos;t.
            </p>
            <p>
              More importantly: we treat Claude as a colleague with real capabilities
              and real limitations, and we design around both. Software built this way
              is categorically different from software with AI bolted on.
            </p>
          </div>
        </div>

        {/* On now */}
        <div className="mb-20">
          <p className="t-eyebrow mb-4">On the moment</p>
          <h2 className="t-section mb-8">The window is open.</h2>
          <div className="space-y-5 t-body text-[15.5px]" style={{ maxWidth: '62ch', lineHeight: 1.78 }}>
            <p>
              Model capability is compounding faster than industries can absorb it.
              Products that were impossible eighteen months ago are now straightforward.
              That gap — between what&apos;s possible and what exists — is where this
              studio operates.
            </p>
            <p>
              We are not building for a hypothetical AI future. We build for what
              Claude can do today, with architecture that absorbs capability
              improvements without rewrites.
            </p>
            <p style={{ color: 'var(--ink)' }}>We&apos;re building while the window is open.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-8 pt-8 border-t" style={{ borderColor: 'var(--hairline)' }}>
          <Link href="/ventures" className="btn-text">
            The manifest <ArrowRight size={11} />
          </Link>
          <Link href="/work-with-us" className="btn-text">
            Work with us <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
