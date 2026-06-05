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
            <p className="font-mono text-[10px] font-medium tracking-[0.3em] uppercase text-construx mb-5 animate-fade-in">
              // CONSTRUX.GROUP
            </p>
            <h1 className="text-display text-gradient-white mb-4 animate-fade-up">
              Building at the<br />
              <span className="text-gradient-orange">AI frontier</span>
            </h1>
            <p className="text-base text-text-muted max-w-md mx-auto leading-relaxed animate-fade-up"
              style={{ animationDelay: '100ms' }}>
              A portfolio of ventures that only exist because AI makes them possible.
            </p>
          </div>
        </div>

        {/* HUD telemetry overlays */}
        <div className="absolute inset-0 z-[5] pointer-events-none select-none hidden lg:block">
          {/* Top-left: sys status */}
          <div className="absolute top-8 left-8 flex flex-col gap-1.5 opacity-50">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-construx" />
              SYS.STATUS: ONLINE
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              ACTIVE.VENTURES: 003
            </p>
          </div>
          {/* Top-right: build ref */}
          <div className="absolute top-8 right-8 flex flex-col items-end gap-1.5 opacity-50">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              BUILD.2025.06
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              AI.FRONTIER — LIVE
            </p>
          </div>
          {/* Bottom-left: orbit data */}
          <div className="absolute bottom-28 left-8 flex flex-col gap-1.5 opacity-50">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              ORBIT.LOCK: ACQUIRED
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              CLICK.PLANET: TO SELECT
            </p>
          </div>
          {/* Bottom-right: signal */}
          <div className="absolute bottom-28 right-8 flex flex-col items-end gap-1.5 opacity-50">
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              SIGNAL: LOCKED
            </p>
            <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              COORD: 51.5074°N / 0.1278°W
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[5] pointer-events-none select-none flex flex-col items-center gap-1.5 opacity-40">
          <span className="font-mono text-[8px] text-text-dim uppercase tracking-[0.3em]">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-dim to-transparent" />
        </div>

        <SolarSystemLoader />
      </section>

      {/* Below-fold: What is Construx */}
      <section className="relative py-28 px-5 grid-bg overflow-hidden" aria-labelledby="what-construx">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4">
                // WHAT WE ARE
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] uppercase tracking-wider"
                  style={{ borderRadius: '3px' }}
                >
                  Read the manifesto <ArrowRight size={15} />
                </Link>
                <Link
                  href="/work-with-us"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all"
                  style={{ borderRadius: '3px' }}
                >
                  Work with us
                </Link>
              </div>
            </div>

            {/* Venture grid */}
            <div className="flex flex-col gap-3">
              {ventures.map((v, i) => (
                <Link
                  key={v.id}
                  href={`/ventures/${v.slug}`}
                  className="group relative flex items-center gap-4 px-5 py-4 transition-all duration-200 bg-[rgba(5,5,18,0.6)] hover:bg-subtle"
                  style={{
                    border: `1px solid ${v.accent}18`,
                    borderRadius: '3px',
                  }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
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
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest mt-0.5"
                      style={{ color: v.accent, opacity: 0.7 }}
                    >
                      {v.category}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="flex-shrink-0 text-text-dim group-hover:text-text-muted group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              ))}
              <div
                className="flex items-center gap-4 px-5 py-4"
                style={{ background: 'rgba(5,5,18,0.35)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '3px' }}
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
                  <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest">More ventures in incubation</p>
                  <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest opacity-60">Entering orbit soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-y border-border py-10 px-5" aria-label="Key facts" style={{ background: 'rgba(3,3,14,0.6)' }}>
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '003', label: 'Live ventures' },
            { value: '100+', label: 'Products shipped' },
            { value: 'AI', label: 'Methodology' },
            { value: '002', label: 'Founders' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-mono text-heading-xl font-bold text-gradient-orange mb-1 tabular-nums">{value}</p>
              <p className="font-mono text-[10px] text-text-dim uppercase tracking-[0.2em]">{label}</p>
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
            className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-[1.02]"
            style={{ borderRadius: '3px' }}
          >
            Get in touch <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
