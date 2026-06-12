import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Work With Us',
  description: "We work with a small number of builders who share our standards. Here's how.",
};

const WHAT_WE_LOOK_FOR = [
  { label: 'Complete ownership', desc: 'You take a domain end-to-end. Design, build, ship, maintain. No hand-offs.' },
  { label: 'Strong engineering standards', desc: "You write code you'd be proud to defend. Production-grade, not prototype-quality." },
  { label: 'AI-native thinking', desc: 'You think in terms of what AI makes possible, not how to bolt AI onto existing solutions.' },
  { label: 'Frontier interest', desc: "You're tracking what's changing in AI capabilities and you know how to exploit the gap." },
];

const STUDIO_SERVICES = [
  { num: '01', title: 'Web Application Build', desc: 'End-to-end design and engineering. Concept to production in 2–8 weeks.' },
  { num: '02', title: 'AI Integration', desc: 'Adding Claude to an existing product properly. Not a chatbot — a real capability.' },
  { num: '03', title: 'Technical Audit', desc: 'An honest assessment of your current architecture and what needs to change.' },
  { num: '04', title: 'Prototype → Production', desc: "You've got something working. We make it production-ready." },
];

export default function WorkWithUsPage() {
  return (
    <div className="min-h-screen pt-36 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-20">
          <p className="t-eyebrow mb-5">Work With Us</p>
          <h1 className="t-page mb-6">Build with us.</h1>
          <p className="t-lead max-w-lg">
            Two ways to work with Construx Group: join the team, or engage Construx
            Studio for your project.
          </p>
        </div>

        {/* Studio section — commercial first */}
        <section className="mb-20">
          <div className="relative card overflow-hidden">
            <span
              className="absolute left-0 top-0 bottom-0 w-[2px]"
              style={{ background: 'linear-gradient(180deg, #06B6D4, #06B6D430)' }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 55% 90% at 0% 0%, rgba(6,182,212,0.07), transparent 60%)',
              }}
            />
            <div className="relative p-9 md:p-12">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] mb-3" style={{ color: '#06B6D4' }}>
                    Web Studio
                  </p>
                  <h2 className="t-section" style={{ fontSize: 'clamp(1.8rem,3.4vw,2.8rem)' }}>
                    Construx Studio.
                  </h2>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                  style={{ color: '#4ade80', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.14)' }}
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Taking engagements
                </span>
              </div>
              <p className="t-lead text-[15px] max-w-2xl mb-10">
                A boutique studio for building production-grade web products. We take on
                a small number of engagements per quarter. No templates, no hand-off
                models, no more clients than we can do properly.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {STUDIO_SERVICES.map(({ num, title, desc }) => (
                  <div key={title} className="card px-6 py-5 flex gap-5">
                    <span className="font-mono text-[10px] tabular-nums pt-1" style={{ color: '#06B6D4' }}>
                      {num}
                    </span>
                    <div>
                      <p className="t-card text-[14.5px] mb-1.5">{title}</p>
                      <p className="t-body text-[12.5px]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Studio — Project Enquiry"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-[13px] font-normal transition-all duration-200 hover:-translate-y-px"
                style={{
                  color: '#000008',
                  background: '#06B6D4',
                  boxShadow: '0 6px 32px rgba(6,182,212,0.25)',
                }}
              >
                Start a conversation <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </section>

        {/* Team section */}
        <section className="mb-20">
          <h2 className="t-section mb-8" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>
            Join the team.
          </h2>
          <p className="t-body max-w-2xl mb-8">
            Construx Group is a small operation that grows slowly and carefully. When we
            add team members, we&apos;re looking for people who can own a domain
            completely — not support roles, not managed delivery. If you need close
            direction, this isn&apos;t the right fit. If you thrive with genuine
            ownership and high standards, keep reading.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {WHAT_WE_LOOK_FOR.map(({ label, desc }) => (
              <div key={label} className="card card-hover px-6 py-5">
                <p className="t-card text-[14.5px] mb-2">{label}</p>
                <p className="t-body text-[13px]">{desc}</p>
              </div>
            ))}
          </div>
          <div className="card px-7 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <p className="t-body text-[13.5px]" style={{ maxWidth: '46ch' }}>
              There are no open roles right now. We read speculative applications from
              people who are genuinely exceptional.
            </p>
            <a
              href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Group — Speculative Application"
              className="btn-ghost flex-shrink-0"
            >
              Speculative application <ArrowUpRight size={12} />
            </a>
          </div>
        </section>

        {/* Bottom nav */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link href="/contact" className="btn-text">
            General contact <ArrowRight size={12} />
          </Link>
          <Link href="/manifesto" className="btn-text">
            Read the manifesto <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
