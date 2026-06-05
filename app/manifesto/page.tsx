import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manifesto',
  description:
    'The Construx Group thesis: AI-first methodology, the portfolio model, and how a small team builds what a small team normally could not.',
};

const iLink = (href: string, label: string) => (
  <Link
    key={href}
    href={href}
    className="text-construx hover:text-orange-400 underline underline-offset-2 decoration-construx/40 hover:decoration-orange-400/60 transition-colors"
  >
    {label}
  </Link>
);

const sections: { number: string; heading: string; paragraphs: ReactNode[] }[] = [
  {
    number: '01',
    heading: 'We build things that require AI to exist.',
    paragraphs: [
      <>Every venture in this portfolio was conceived because the current state of AI made it tractable for the first time. Not "AI helps us go faster." AI is the reason the thing is possible at all.</>,
      <>{iLink('/ventures/scoutr', 'Scoutr')} scans and reasons about thousands of product listings in real time — impractical to hand-code, trivial for Claude. {iLink('/ventures/the-marqet', 'The Marqet')} needed a way to organise and surface hundreds of AI configurations with genuine semantic understanding — only possible with frontier language models. {iLink('/ventures/the-hyve', 'The Hyve')} needed an AI team member that holds the full context of an entire project's history — only possible with the context windows and instruction fidelity of 2026-era AI.</>,
      <>If you could have built it in 2020 without AI, it's not a Construx venture.</>,
    ],
  },
  {
    number: '02',
    heading: 'Claude is our primary instrument. Not a shortcut.',
    paragraphs: [
      <>We use Claude and Anthropic's tools as core methodology, not as a productivity hack bolted onto a traditional build process. Claude is in the room from the first design decision. It helps define what we're building, surfaces edge cases, drafts the first versions of copy and code, and operates as a genuine collaborator through every layer of production.</>,
      <>The output is never shipped raw. But the speed at which we reach a first version worth reacting to is qualitatively different from how a traditional studio works. A two-person team operates with the output velocity of a ten-person one — not by cutting corners, but by eliminating the dead time between "I have an idea" and "I have a working thing to critique."</>,
      <>This is the model. It's not changing. {iLink('/journal/ai-first-methodology', 'Read more about the methodology')} — including {iLink('/journal/prompt-architecture-patterns', 'the prompt architecture patterns')} we've converged on and {iLink('/journal/context-window-discipline', 'how we manage context to keep output quality high')}.</>,
    ],
  },
  {
    number: '03',
    heading: 'Portfolio, not one big exit.',
    paragraphs: [
      <>The conventional startup playbook: pick one bet, go all-in, raise capital to buy time, optimise for an exit. We are not doing that.</>,
      <>The Construx model is a permanent holding structure for multiple independent ventures — each with its own market, its own brand, its own trajectory. Some will grow large. Some will stay focused. Some will get acquired. None of this requires the group to change shape.</>,
      <>This model is only viable because AI collapses the cost of building something new. When a full-featured product can be taken from concept to live in weeks rather than months, you can afford to run multiple bets simultaneously. We can. {iLink('/journal/portfolio-model', 'The full case for the portfolio model')} — and {iLink('/journal/two-person-operating-model', 'how we decide what to build next')}.</>,
    ],
  },
  {
    number: '04',
    heading: 'Small is a feature.',
    paragraphs: [
      <>We are two people. We intend to stay small on purpose.</>,
      <>Small means every decision is made by people who understand the product. It means there is no miscommunication layer between strategy and execution. It means we can turn a venture on its head in a day if the market tells us something.</>,
      <>This does not mean we build small things. It means we are deliberate about what we choose to build, and we rely on the best tools available to make two people punch absurdly above their weight. Right now, those tools are Claude, Anthropic's platform, and everything we've learned building with them.</>,
      <>We are not a boutique agency. We are not a micro-fund. We are a small team building a serious group of companies. The distinction matters.</>,
    ],
  },
  {
    number: '05',
    heading: 'Build in public. Own the record.',
    paragraphs: [
      <>We document what we build and how we build it. Not as a growth tactic — as an honest record of what this approach actually produces.</>,
      <>If something doesn't work, we write about why. If a venture pivots, the journal will show you the reasoning. If AI tooling evolves and we change our methods, you'll see that too.</>,
      <>The {iLink('/journal', 'journal')} is not marketing. It is documentation. Including {iLink('/journal/building-this-website', 'the story of this website itself')}.</>,
    ],
  },
];

export default function ManifestoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-5 animate-fade-in">
            // OUR THESIS
          </p>
          <h1 className="text-display text-text-base mb-6 leading-none animate-fade-up"
            style={{ animationDelay: '90ms' }}>
            The<br />
            <span className="text-gradient-orange">Manifesto</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-xl mx-auto animate-fade-up"
            style={{ animationDelay: '220ms' }}>
            Five principles. One model. Everything Construx builds follows from these.
          </p>
        </div>
      </section>

      {/* Manifesto body */}
      <section className="relative px-5 py-20 mx-auto max-w-3xl">
        <div className="flex flex-col gap-0">
          {sections.map((s, i) => (
            <div
              key={s.number}
              id={s.number}
              className="relative group scroll-mt-24"
            >
              {/* Connector line — left-5 = 20px = center of h-10 w-10 number box */}
              {i < sections.length - 1 && (
                <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-construx/20 to-transparent pointer-events-none" />
              )}

              <div className="flex gap-7 pb-20">
                {/* Number */}
                <div className="flex-shrink-0 pt-1">
                  <a
                    href={`#${s.number}`}
                    className="h-10 w-10 flex items-center justify-center font-mono text-xs font-bold text-construx hover:bg-construx/15 transition-colors"
                    style={{
                      background: 'rgba(249,115,22,0.08)',
                      border: '1px solid rgba(249,115,22,0.2)',
                      borderRadius: '3px',
                    }}
                    aria-label={`Section ${s.number}`}
                  >
                    {s.number}
                  </a>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-heading-xl text-text-base mb-5 leading-tight">
                    {s.heading}
                  </h2>
                  {s.paragraphs.map((para, pi) => (
                    <p
                      key={pi}
                      className="text-text-muted leading-relaxed text-base mb-4 last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sign-off */}
        <div
          className="px-8 py-8 mt-4"
          style={{
            background: 'rgba(5,5,18,0.8)',
            border: '1px solid rgba(249,115,22,0.18)',
            borderRadius: '3px',
          }}
        >
          <p className="text-text-muted leading-relaxed mb-4">
            If this resonates — as a user, a collaborator, or someone who wants to build with us —
            the next step is the same.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-wider"
              style={{ borderRadius: '3px' }}
            >
              Get in touch <ArrowRight size={14} />
            </Link>
            <Link
              href="/founders"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all uppercase tracking-wider"
              style={{ borderRadius: '3px' }}
            >
              Meet the founders
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
