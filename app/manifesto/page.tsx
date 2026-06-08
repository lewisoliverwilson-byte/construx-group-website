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
    title: 'Build properly or don\'t build',
    body: "Fast doesn't mean sloppy. We move quickly because our engineering is sound, not because we're skipping steps. Every product we ship is production-grade from day one.",
  },
  {
    num: '03',
    title: 'Small teams ship better products',
    body: 'Coordination overhead is the enemy of good software. We keep teams small, roles clear, and ownership complete. One person who cares beats ten who don\'t.',
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
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">

        {/* Header */}
        <div className="mb-20">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-5">Manifesto</p>
          <h1
            className="text-display text-white/90 mb-6"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            How we<br />build.
          </h1>
          <p className="text-[16px] text-white/45 font-light max-w-xl leading-relaxed">
            These are the principles that govern every product decision we make. They're not aspirational. They're operational.
          </p>
        </div>

        {/* Pull quote */}
        <blockquote className="relative mb-20 py-8 px-8 border-l-2 border-white/15">
          <p
            className="text-[clamp(1.4rem,3vw,2.2rem)] text-white/72 leading-[1.2] font-light"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 500, letterSpacing: '-0.01em' }}
          >
            "We build the things that are only possible now that AI exists — and we build them properly."
          </p>
        </blockquote>

        {/* Principles */}
        <div className="space-y-0 mb-20">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.num}
              className="group py-8 border-b border-border flex flex-col md:flex-row gap-5 md:gap-10"
            >
              <div className="flex-shrink-0 flex items-start gap-4 md:w-52">
                <span className="font-mono text-[10px] text-white/18 tabular-nums mt-1">{p.num}</span>
                <h3
                  className="text-[18px] text-white/75 group-hover:text-white/90 transition-colors leading-snug"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600, letterSpacing: '-0.01em' }}
                >
                  {p.title}
                </h3>
              </div>
              <p className="text-[14px] text-white/40 font-light leading-relaxed flex-1 pt-0.5">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        {/* On building with AI */}
        <div className="mb-20">
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-white/88 mb-6 leading-[0.96]"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            On Claude.
          </h2>
          <div className="space-y-4 text-[14.5px] text-white/42 font-light leading-relaxed max-w-2xl">
            <p>
              Every product in our portfolio is built on Anthropic's Claude. This isn't a vendor choice — it's a conviction. We believe Claude represents the clearest path to genuinely useful AI, and we've built our entire technical foundation around that bet.
            </p>
            <p>
              We're not neutral on model choice. We've tested everything. Claude wins on reasoning quality, instruction following, and the kind of long-context work our products require. When that changes, we'll change. It hasn't.
            </p>
            <p>
              More importantly: we treat Claude as a team member with real capabilities and real limitations. We design around both. Products built this way are categorically different from products that treat AI as a feature toggle.
            </p>
          </div>
        </div>

        {/* On the current moment */}
        <div className="mb-20">
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-white/88 mb-6 leading-[0.96]"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            On now.
          </h2>
          <div className="space-y-4 text-[14.5px] text-white/42 font-light leading-relaxed max-w-2xl">
            <p>
              The current moment in AI is genuinely unusual. Model capabilities are compounding faster than most industries can absorb. Products that were impossible eighteen months ago are now straightforward. That gap — between what's possible and what exists — is where we operate.
            </p>
            <p>
              We are not building for a hypothetical AI future. We're building for what Claude can do today, knowing it will be more capable tomorrow. Our architecture reflects that: built to take advantage of capability improvements without requiring rewrites.
            </p>
            <p>
              The window is open. We're building while it is.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <Link
            href="/ventures"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/70 transition-colors"
          >
            See the portfolio <ArrowRight size={12} />
          </Link>
          <Link
            href="/work-with-us"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/70 transition-colors"
          >
            Work with us <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
