import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import StatusBadge from '@/components/ui/StatusBadge';
import SolarSystemLoader from '@/components/solar-system/SolarSystemLoader';

export const metadata: Metadata = {
  title: 'Construx Group — AI-First Ventures',
  description:
    'A portfolio of AI-first ventures. We build the things that are only possible now that AI exists.',
};

export default function HomePage() {
  return (
    <>
      {/* Hero: solar system */}
      <section className="relative" aria-label="Interactive venture explorer">
        {/* SSR headline — always indexed by crawlers */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none px-5">
          <div className="text-center max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-construx mb-5 animate-fade-in">
              Construx Group
            </p>
            <h1 className="text-display text-gradient-white mb-4 animate-fade-up">
              Building at the<br />
              <span className="text-gradient-orange">AI frontier</span>
            </h1>
            <p className="text-base text-text-muted max-w-md mx-auto leading-relaxed animate-fade-up"
              style={{ animationDelay: '100ms' }}>
              A portfolio of ventures that only exist because AI makes them possible.
              <br className="hidden sm:block" />
              Drag the system. Click a planet.
            </p>
          </div>
        </div>

        <SolarSystemLoader />
      </section>

      {/* Below-fold: What is Construx */}
      <section className="relative py-28 px-5 grid-bg overflow-hidden" aria-labelledby="what-construx">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-construx mb-4">
                What we are
              </p>
              <h2 id="what-construx" className="text-display-sm text-text-base mb-6 leading-tight">
                Not an agency.<br />
                Not a fund.<br />
                <span className="text-gradient-orange">A builder.</span>
              </h2>
              <p className="text-text-muted leading-relaxed mb-5">
                Construx Group is the parent of a growing portfolio of AI-first software ventures.
                We don't consult from the sideline — we build and own the products we ship.
              </p>
              <p className="text-text-muted leading-relaxed mb-8">
                Claude and Anthropic's tooling are our primary instrument. The result is a small team
                with the output of a much larger one — and products that simply weren't possible to
                build before now.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/manifesto"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
                >
                  Read the manifesto <ArrowRight size={15} />
                </Link>
                <Link
                  href="/work-with-us"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all"
                >
                  Work with us
                </Link>
              </div>
            </div>

            {/* Venture grid */}
            <div className="flex flex-col gap-3">
              {ventures.map((v, i) => (
                <div
                  key={v.id}
                  className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:bg-subtle cursor-default"
                  style={{
                    background: 'rgba(5,5,18,0.6)',
                    border: `1px solid ${v.accent}1A`,
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}cc, ${v.accent}44)`,
                      boxShadow: `0 0 16px ${v.accent}44`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-text-base">{v.name}</span>
                      <StatusBadge status={v.status} />
                    </div>
                    <p className="text-xs text-text-muted truncate">{v.tagline}</p>
                  </div>
                  <Link
                    href={`/ventures/${v.slug}`}
                    className="flex-shrink-0 flex items-center gap-1 text-xs text-text-dim group-hover:text-text-muted transition-colors"
                    aria-label={`Learn more about ${v.name}`}
                  >
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
              <div
                className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(5,5,18,0.35)', border: '1px dashed rgba(255,255,255,0.07)' }}
              >
                <div className="flex -space-x-1.5">
                  {[0.3, 0.2, 0.12].map((o, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border border-border"
                      style={{ background: `rgba(255,255,255,${o})` }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium text-text-dim">More ventures in incubation</p>
                  <p className="text-xs text-text-dim opacity-60">Entering orbit soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-y border-border py-12 px-5" aria-label="Key facts">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '3', label: 'Live ventures' },
            { value: '100+', label: 'Products shipped' },
            { value: 'AI-first', label: 'Methodology' },
            { value: '2', label: 'Founders' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-heading-xl font-bold text-gradient-orange mb-1">{value}</p>
              <p className="text-xs text-text-dim uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-24 px-5 text-center" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-2xl">
          <Zap className="mx-auto mb-5 text-construx animate-glow-pulse" size={28} />
          <h2 id="cta-heading" className="text-display-sm text-text-base mb-4">
            Build with us.
          </h2>
          <p className="text-text-muted mb-8 leading-relaxed">
            If you need something built properly at the frontier of what AI can do,
            we should talk.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-[1.02]"
          >
            Get in touch <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
