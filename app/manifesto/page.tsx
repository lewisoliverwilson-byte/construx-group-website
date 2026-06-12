import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manifesto',
  description: 'How we think about building AI-first ventures. Our principles, our method, and what we believe.',
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
    body: "Fast doesn't mean sloppy. We move quickly because our engineering is sound, not because we're skipping steps. Every product we ship is production-grade from day one.",
  },
  {
    num: '03',
    title: 'Small teams ship better products',
    body: "Coordination overhead is the enemy of good software. We keep teams small, roles clear, and ownership complete. One person who cares beats ten who don't.",
  },
  {
    num: '04',
    title: 'Claude is a team member, not a tool',
    body: "We don't use AI as a feature. We use it as infrastructure. The best products we've built treat Claude as a first-class member of the team with real responsibilities.",
  },
  {
    num: '05',
    title: 'The window matters',
    body: "We're operating in a window where AI capabilities are growing faster than most builders are exploiting them. That window won't be open forever. We move accordingly.",
  },
  {
    num: '06',
    title: 'Margins are the mission',
    body: "We're building real businesses with real unit economics. Every venture needs a sustainable model. Building at the AI frontier doesn't mean ignoring fundamentals.",
  },
];

export default function ManifestoPage() {
  return (
    <div className="min-h-screen pt-36 pb-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-24">
          <p className="t-eyebrow mb-6">Manifesto</p>
          <h1 className="t-page mb-7">
            How we
            <br />
            build.
          </h1>
          <p className="t-lead max-w-xl">
            These are the principles that govern every product decision we make.
            They&apos;re not aspirational. They&apos;re operational.
          </p>
        </div>

        {/* Pull quote */}
        <blockquote className="relative mb-24">
          <span
            className="absolute -left-2 -top-8 font-display select-none pointer-events-none"
            style={{ fontSize: '7rem', fontWeight: 700, color: 'rgba(139,92,246,0.14)', lineHeight: 1 }}
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p
            className="font-display relative text-[clamp(1.5rem,3.2vw,2.4rem)] text-white/80 leading-[1.18]"
            style={{ fontWeight: 500, letterSpacing: '-0.015em' }}
          >
            We build the things that are only possible now that AI exists — and we
            build them properly.
          </p>
        </blockquote>

        {/* Principles */}
        <div className="mb-24">
          {PRINCIPLES.map((p) => (
            <div
              key={p.num}
              className="group py-9 border-b border-border flex flex-col md:flex-row gap-5 md:gap-12"
            >
              <div className="flex-shrink-0 flex items-start gap-5 md:w-60">
                <span className="font-mono text-[10px] text-white/20 tabular-nums mt-1.5">{p.num}</span>
                <h3 className="t-card text-[18px] leading-snug group-hover:text-white transition-colors">
                  {p.title}
                </h3>
              </div>
              <p className="t-body text-[14.5px] flex-1 pt-0.5">{p.body}</p>
            </div>
          ))}
        </div>

        {/* On Claude */}
        <div className="mb-24">
          <h2 className="t-section mb-8" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}>
            On Claude.
          </h2>
          <div className="space-y-5 t-body text-[15px] max-w-2xl" style={{ lineHeight: 1.8 }}>
            <p>
              Every product in our portfolio is built on Anthropic&apos;s Claude. This
              isn&apos;t a vendor choice — it&apos;s a conviction. We believe Claude
              represents the clearest path to genuinely useful AI, and we&apos;ve built
              our entire technical foundation around that bet.
            </p>
            <p>
              We&apos;re not neutral on model choice. We&apos;ve tested everything.
              Claude wins on reasoning quality, instruction following, and the kind of
              long-context work our products require. When that changes, we&apos;ll
              change. It hasn&apos;t.
            </p>
            <p>
              More importantly: we treat Claude as a team member with real capabilities
              and real limitations. We design around both. Products built this way are
              categorically different from products that treat AI as a feature toggle.
            </p>
          </div>
        </div>

        {/* On the current moment */}
        <div className="mb-24">
          <h2 className="t-section mb-8" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}>
            On now.
          </h2>
          <div className="space-y-5 t-body text-[15px] max-w-2xl" style={{ lineHeight: 1.8 }}>
            <p>
              The current moment in AI is genuinely unusual. Model capabilities are
              compounding faster than most industries can absorb. Products that were
              impossible eighteen months ago are now straightforward. That gap — between
              what&apos;s possible and what exists — is where we operate.
            </p>
            <p>
              We are not building for a hypothetical AI future. We&apos;re building for
              what Claude can do today, knowing it will be more capable tomorrow. Our
              architecture reflects that: built to take advantage of capability
              improvements without requiring rewrites.
            </p>
            <p className="text-white/60">The window is open. We&apos;re building while it is.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-7 pt-6 border-t border-border">
          <Link href="/ventures" className="btn-text">
            See the portfolio <ArrowRight size={13} />
          </Link>
          <Link href="/work-with-us" className="btn-text">
            Work with us <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
