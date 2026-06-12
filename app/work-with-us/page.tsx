import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Work With Us',
  description: 'Commission Construx Studio, or join the team. Both doors are narrow on purpose.',
};

const STUDIO_SERVICES = [
  { num: '01', title: 'Web application build', desc: 'End-to-end design and engineering. Concept to production in 2–8 weeks, fixed scope.' },
  { num: '02', title: 'AI integration', desc: 'Adding Claude to an existing product properly. Not a chatbot — a real capability.' },
  { num: '03', title: 'Technical audit', desc: 'An honest assessment of your architecture and what needs to change.' },
  { num: '04', title: 'Prototype to production', desc: "You've got something working. We make it production-ready." },
];

const WHAT_WE_LOOK_FOR = [
  { num: '01', label: 'Complete ownership', desc: 'You take a domain end-to-end. Design, build, ship, maintain. No hand-offs.' },
  { num: '02', label: 'Engineering standards', desc: "Code you'd be proud to defend. Production-grade, not prototype-quality." },
  { num: '03', label: 'AI-native thinking', desc: 'You think in terms of what AI makes possible, not how to bolt it on.' },
  { num: '04', label: 'Frontier awareness', desc: "You track what's changing in AI capability and know how to exploit the gap." },
];

export default function WorkWithUsPage() {
  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Work with us</p>
          <h1 className="t-page mb-7">Two doors.<br />Both narrow.</h1>
          <p className="t-lead" style={{ maxWidth: '48ch' }}>
            Commission the studio for your project, or join the team. We keep both
            deliberately selective — it&apos;s how the quality holds.
          </p>
        </div>

        <div className="title-rule mb-16" />

        {/* Commission */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="t-eyebrow mb-4">Door one</p>
              <h2 className="t-section mb-6">Commission<br />the studio.</h2>
              <p className="t-body mb-8">
                Through Construx Studio we take a small number of engagements per
                quarter. The same standard we hold for our own products, applied to
                yours. No templates, no hand-off models, no more clients than we can
                serve properly.
              </p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Studio — Project Enquiry"
                className="btn-ink"
              >
                Start a conversation <ArrowUpRight size={12} />
              </a>
            </div>
            <div className="lg:col-span-8">
              <div className="border-t" style={{ borderColor: 'var(--hairline)' }}>
                {STUDIO_SERVICES.map(({ num, title, desc }) => (
                  <div
                    key={title}
                    className="grid grid-cols-12 gap-4 py-7 border-b"
                    style={{ borderColor: 'var(--hairline)' }}
                  >
                    <span className="col-span-1 font-mono text-[11px] tabular-nums pt-0.5" style={{ color: 'var(--ink-faint)' }}>
                      {num}
                    </span>
                    <h3 className="col-span-11 md:col-span-4 t-card text-[17px] leading-tight">{title}</h3>
                    <p className="col-span-11 col-start-2 md:col-span-7 md:col-start-6 t-body text-[14px]">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-12 gap-y-2 pt-6">
                <span className="t-fact"><span className="t-meta mr-2" style={{ fontSize: 9.5 }}>Timeline</span>2–8 weeks</span>
                <span className="t-fact"><span className="t-meta mr-2" style={{ fontSize: 9.5 }}>Scope</span>Fixed</span>
                <span className="t-fact"><span className="t-meta mr-2" style={{ fontSize: 9.5 }}>Slots</span>Limited per quarter</span>
              </div>
            </div>
          </div>
        </section>

        {/* Join */}
        <section className="mb-16 pt-16 border-t" style={{ borderColor: 'var(--hairline)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="t-eyebrow mb-4">Door two</p>
              <h2 className="t-section mb-6">Join the<br />studio.</h2>
              <p className="t-body mb-8">
                The team grows slowly and carefully. New people own a domain
                completely — not support roles, not managed delivery. There are no
                open roles right now; we read speculative applications from people who
                are genuinely exceptional.
              </p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Group — Speculative Application"
                className="btn-line"
              >
                Speculative application <ArrowUpRight size={12} />
              </a>
            </div>
            <div className="lg:col-span-8">
              <div className="border-t" style={{ borderColor: 'var(--hairline)' }}>
                {WHAT_WE_LOOK_FOR.map(({ num, label, desc }) => (
                  <div
                    key={label}
                    className="grid grid-cols-12 gap-4 py-7 border-b"
                    style={{ borderColor: 'var(--hairline)' }}
                  >
                    <span className="col-span-1 font-mono text-[11px] tabular-nums pt-0.5" style={{ color: 'var(--ink-faint)' }}>
                      {num}
                    </span>
                    <h3 className="col-span-11 md:col-span-4 t-card text-[17px] leading-tight">{label}</h3>
                    <p className="col-span-11 col-start-2 md:col-span-7 md:col-start-6 t-body text-[14px]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom nav */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center gap-7" style={{ borderColor: 'var(--hairline)' }}>
          <Link href="/contact" className="btn-text">
            General contact <ArrowRight size={11} />
          </Link>
          <Link href="/manifesto" className="btn-text">
            Read the manifesto <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
