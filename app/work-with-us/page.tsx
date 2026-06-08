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
  { label: 'AI-native thinking', desc: "You think in terms of what AI makes possible, not how to bolt AI onto existing solutions." },
  { label: 'Frontier interest', desc: "You're tracking what's changing in AI capabilities and you know how to exploit the gap." },
];

const STUDIO_SERVICES = [
  { title: 'Web Application Build', desc: 'End-to-end design and engineering. Concept to production in 2–8 weeks.' },
  { title: 'AI Integration', desc: 'Adding Claude to an existing product properly. Not a chatbot — a real capability.' },
  { title: 'Technical Audit', desc: 'An honest assessment of your current architecture and what needs to change.' },
  { title: 'Prototype → Production', desc: "You've got something working. We make it production-ready." },
];

export default function WorkWithUsPage() {
  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">

        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">Work With Us</p>
          <h1
            className="text-display text-white/90 mb-5"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            Build with us.
          </h1>
          <p className="text-[15px] text-white/40 font-light max-w-lg leading-relaxed">
            Two ways to work with Construx Group: join the team, or engage Construx Studio for your project.
          </p>
        </div>

        {/* Team section */}
        <section className="mb-20">
          <h2
            className="text-[clamp(1.6rem,3vw,2.4rem)] text-white/82 mb-6"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Join the team.
          </h2>
          <div className="glass rounded-xl p-8 border-t-2 border-white/08">
            <p className="text-[14px] text-white/42 font-light leading-relaxed max-w-2xl mb-6">
              Construx Group is a small operation that grows slowly and carefully. When we add team members, we're looking for people who can own a domain completely — not support roles, not managed delivery. If you need close direction, this isn't the right fit. If you thrive with genuine ownership and high standards, keep reading.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {WHAT_WE_LOOK_FOR.map(({ label, desc }) => (
                <div key={label} className="bg-white/[0.03] rounded-md px-4 py-4 border border-white/[0.06]">
                  <p
                    className="text-[13px] text-white/72 mb-1.5"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                  >
                    {label}
                  </p>
                  <p className="text-[12px] text-white/35 font-light leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="pt-5 border-t border-border">
              <p className="text-[13px] text-white/28 font-light mb-4">
                There are no open roles right now. We read speculative applications from people who are genuinely exceptional.
              </p>
              <a
                href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Group — Speculative Application"
                className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35 hover:text-white/65 transition-colors"
              >
                Send a speculative application <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </section>

        {/* Studio section */}
        <section className="mb-16">
          <h2
            className="text-[clamp(1.6rem,3vw,2.4rem)] text-white/82 mb-2"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Construx Studio.
          </h2>
          <p className="text-[14px] text-white/38 font-light mb-6">
            Boutique web development for founders and operators who care about quality.
          </p>
          <div className="glass rounded-xl p-8" style={{ borderTop: '2px solid #06B6D4' }}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] mb-2" style={{ color: '#06B6D4' }}>
                  Web Studio
                </p>
                <h3
                  className="text-[20px] text-white/80"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
                >
                  Construx Studio
                </h3>
              </div>
              <span
                className="font-mono text-[8px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-sm"
                style={{ color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Launching Soon
              </span>
            </div>
            <p className="text-[14px] text-white/42 font-light leading-relaxed max-w-2xl mb-7">
              A boutique studio for building production-grade web products. We take on a small number of engagements per quarter. No templates, no hand-off models, no more clients than we can do properly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {STUDIO_SERVICES.map(({ title, desc }) => (
                <div key={title} className="bg-white/[0.03] rounded-md px-4 py-4 border border-white/[0.05]">
                  <p
                    className="text-[13px] text-white/68 mb-1.5"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                  >
                    {title}
                  </p>
                  <p className="text-[12px] text-white/32 font-light">{desc}</p>
                </div>
              ))}
            </div>
            <a
              href="mailto:lewis.oliver.wilson@googlemail.com?subject=Construx Studio — Project Enquiry"
              className="inline-flex items-center gap-2 text-[13px] font-light transition-colors"
              style={{ color: '#06B6D4' }}
            >
              Start a conversation <ArrowUpRight size={13} />
            </a>
          </div>
        </section>

        {/* Bottom nav */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Link href="/contact" className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/65 transition-colors">
            General contact <ArrowRight size={11} />
          </Link>
          <Link href="/manifesto" className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/65 transition-colors">
            Read the manifesto <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
