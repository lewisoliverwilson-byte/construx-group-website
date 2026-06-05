import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Zap, Layers, Code2, Rocket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Work With Us',
  description:
    'Construx Group builds AI-first products for clients who need something built properly. Here is how engagements work.',
};

const capabilities = [
  {
    icon: Zap,
    title: 'AI-first product building',
    body: 'We architect products from the ground up around AI capabilities — not bolted on after the fact. LLM integration, prompt engineering, RAG pipelines, agent architectures.',
    accent: '#F97316',
  },
  {
    icon: Code2,
    title: 'Full-stack development',
    body: 'End-to-end product delivery: React/Next.js frontends, serverless backends, database design, CI/CD, AWS infrastructure. We build and we ship.',
    accent: '#3B82F6',
  },
  {
    icon: Layers,
    title: 'Product strategy',
    body: 'We help teams figure out what to build with AI before they build it. Market framing, user research, product definition, and go-to-market approach.',
    accent: '#8B5CF6',
  },
  {
    icon: Rocket,
    title: 'Fast prototyping',
    body: 'From zero to a working, deployed prototype in days. Useful for validating a market, securing investment, or unblocking a team that needs to see something real.',
    accent: '#C8F50C',
  },
];

const process = [
  {
    step: '01',
    title: 'Discovery call',
    body: "A focused 45-minute conversation to understand what you want to build, why, and what success looks like. We'll be direct about whether it's a fit.",
  },
  {
    step: '02',
    title: 'Proposal',
    body: 'A clear scope of work, timeline, and fixed price. No vague retainers. No hourly billing that incentivises slow work.',
  },
  {
    step: '03',
    title: 'Build',
    body: 'We work fast, communicate clearly, and show you working software early. No long silences followed by a big reveal.',
  },
  {
    step: '04',
    title: 'Ship & hand over',
    body: "Deployed, documented, and handed over with everything you need to run it. We're available for ongoing support if you need it.",
  },
];

export default function WorkWithUsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5 overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.28em] uppercase text-construx mb-5">
            Client work
          </p>
          <h1 className="text-display text-text-base mb-6 leading-none">
            Work<br />
            <span className="text-gradient-orange">With Us</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-xl mb-10">
            We build AI-first products for organisations who need something built properly —
            not a slide deck, not a POC that falls apart under load, but a real product that ships.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_24px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:scale-[1.02]"
            >
              Start the conversation <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="px-5 py-20 mx-auto max-w-6xl">
        <h2 className="text-xs font-semibold tracking-[0.28em] uppercase text-text-dim mb-10">
          What we build
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${accent}18`,
              }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: `${accent}14`, color: accent }}
              >
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-bold text-text-base">{title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-12 pb-20 mx-auto max-w-4xl border-t border-border">
        <h2 className="text-heading-xl text-text-base mb-12">
          How an engagement works
        </h2>
        <div className="flex flex-col gap-0">
          {process.map((p, i) => (
            <div key={p.step} className="relative flex gap-7 pb-12 last:pb-0">
              {i < process.length - 1 && (
                <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-construx/25 to-transparent" />
              )}
              <div className="flex-shrink-0">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold text-construx"
                  style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.22)' }}
                >
                  {p.step}
                </div>
              </div>
              <div className="pt-1.5">
                <h3 className="text-base font-bold text-text-base mb-2">{p.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proof placeholder */}
      <section className="px-5 py-16 mx-auto max-w-6xl border-t border-border">
        <h2 className="text-xs font-semibold tracking-[0.28em] uppercase text-text-dim mb-8">
          Proof of work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl p-7"
              style={{ background: 'rgba(5,5,18,0.5)', border: '1px dashed rgba(255,255,255,0.07)' }}
            >
              <div className="h-4 w-24 rounded bg-border mb-3" />
              <div className="h-3 w-full rounded bg-border/60 mb-2" />
              <div className="h-3 w-4/5 rounded bg-border/60 mb-2" />
              <div className="h-3 w-2/3 rounded bg-border/40" />
              <p className="mt-4 text-xs text-text-dim italic">Case study coming soon</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-24 text-center mx-auto max-w-2xl">
        <h2 className="text-display-sm text-text-base mb-5">
          Ready to build something?
        </h2>
        <p className="text-text-muted leading-relaxed mb-8">
          If you have a product you want to build AI-first — properly, without shortcuts —
          we'd like to hear about it.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-[1.02]"
        >
          Get in touch <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
