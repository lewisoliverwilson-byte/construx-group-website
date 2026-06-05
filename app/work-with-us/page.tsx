import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Zap, Layers, Code2, Rocket, BookOpen, ExternalLink } from 'lucide-react';

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
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-5 animate-fade-in">
            // CLIENT WORK
          </p>
          <h1 className="text-display text-text-base mb-6 leading-none animate-fade-up"
            style={{ animationDelay: '90ms' }}>
            Work<br />
            <span className="text-gradient-orange">With Us</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-xl mb-10 animate-fade-up"
            style={{ animationDelay: '220ms' }}>
            We build AI-first products for organisations who need something built properly —
            not a slide deck, not a POC that falls apart under load, but a real product that ships.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '360ms' }}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_24px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:scale-[1.02] uppercase tracking-wider"
              style={{ borderRadius: '3px' }}
            >
              Start the conversation <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="px-5 py-20 mx-auto max-w-6xl">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-10">
          // WHAT WE BUILD
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="p-6 flex flex-col gap-4"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${accent}18`,
                borderRadius: '3px',
              }}
            >
              <div
                className="h-10 w-10 flex items-center justify-center"
                style={{ background: `${accent}14`, color: accent, borderRadius: '3px' }}
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
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-3">
          // HOW IT WORKS
        </h2>
        <h3 className="text-heading-xl text-text-base mb-10">
          How an engagement works
        </h3>
        <div className="flex flex-col gap-0">
          {process.map((p, i) => (
            <div key={p.step} className="relative flex gap-7 pb-12 last:pb-0">
              {i < process.length - 1 && (
                <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-construx/25 to-transparent" />
              )}
              <div className="flex-shrink-0">
                <div
                  className="h-10 w-10 flex items-center justify-center font-mono text-xs font-bold text-construx"
                  style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.22)', borderRadius: '3px' }}
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

      {/* Recommended reading */}
      <div className="px-5 pb-10 mx-auto max-w-4xl flex flex-wrap gap-5">
        <Link
          href="/journal/how-we-ship"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-construx hover:text-orange-400 transition-colors uppercase tracking-widest group"
        >
          <ExternalLink size={11} className="flex-shrink-0" />
          The full build loop
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/journal/ai-speed-cuts-both-ways"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest group"
        >
          <ExternalLink size={11} className="flex-shrink-0" />
          Why direction matters more than speed
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/journal/building-this-website"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest group"
        >
          <ExternalLink size={11} className="flex-shrink-0" />
          How this site was built
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Not a fit */}
      <section className="px-5 pb-6 mx-auto max-w-4xl">
        <div
          className="p-6"
          style={{
            background: 'rgba(3,3,14,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '3px',
          }}
        >
          <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-5">
            // PROBABLY NOT A FIT
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 mb-5">
            {[
              'Long-term on-site staff augmentation',
              'Projects that could have been built in 2020',
              'Hourly billing or open-ended retainers',
              'Design agencies or branding-only work',
              'Six-month sprints with monthly check-ins',
              'Teams that want the AI layer bolted on after',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <span className="font-mono text-[10px] text-red-500/40 flex-shrink-0 mt-0.5">×</span>
                <span className="text-sm text-text-dim leading-snug">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-text-muted leading-relaxed border-t border-border pt-4">
            If none of those apply, we'd genuinely like to hear what you're building.
          </p>
        </div>
      </section>

      {/* Technical stack */}
      <section className="px-5 py-16 mx-auto max-w-6xl border-t border-border">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-8">
          // TECHNICAL STACK
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Next.js', category: 'Frontend' },
            { label: 'React', category: 'Frontend' },
            { label: 'TypeScript', category: 'Language' },
            { label: 'Tailwind CSS', category: 'Styling' },
            { label: 'Claude API', category: 'AI' },
            { label: 'Claude Code', category: 'AI' },
            { label: 'AWS Amplify', category: 'Infra' },
            { label: 'Node.js', category: 'Backend' },
            { label: 'PostgreSQL', category: 'Database' },
            { label: 'React Three Fiber', category: '3D' },
            { label: 'Framer Motion', category: 'Animation' },
            { label: 'Resend', category: 'Email' },
          ].map(({ label, category }) => (
            <div
              key={label}
              className="flex flex-col px-3 py-3 gap-1"
              style={{
                background: 'rgba(5,5,18,0.6)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '3px',
              }}
            >
              <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-construx/60">{category}</p>
              <p className="text-sm font-semibold text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof of work */}
      <section className="px-5 py-16 mx-auto max-w-6xl border-t border-border">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-8">
          // PROOF OF WORK
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: 'Scoutr',
              accent: '#C8F50C',
              category: 'Resell Intelligence',
              headline: 'From zero to live in 3 weeks',
              summary: 'Full-stack AI product with real-time product scanning, Amazon + eBay profit calculation, and Claude-powered classification. Users paste a URL, get actionable margin data in under 5 seconds.',
              stats: [{ label: 'Time to scan', value: '<5s' }, { label: 'Live', value: 'Yes' }],
              journalSlug: 'building-scoutr',
            },
            {
              name: 'The Marqet',
              accent: '#3B82F6',
              category: 'AI Marketplace',
              headline: '167+ listings, built in weeks',
              summary: 'AI-native marketplace for professional Claude configurations. Custom CMS, semantic search, category filtering, and a content pipeline that generated 167 listings across 4 verticals without manual work.',
              stats: [{ label: 'Listings', value: '167+' }, { label: 'Live', value: 'Yes' }],
              journalSlug: 'the-marqet-167-listings',
            },
            {
              name: 'The Hyve',
              accent: '#8B5CF6',
              category: 'AI Workspace',
              headline: 'Replaced 4 tools with one',
              summary: 'Full-stack workspace replacing Slack, Notion, GitHub discussions, and Discord. Real-time channels, kanban, docs, and a vector-memory AI team member — all in a single URL on AWS.',
              stats: [{ label: 'Tools replaced', value: '4' }, { label: 'Live', value: 'Yes' }],
              journalSlug: 'building-the-hyve',
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex flex-col p-6"
              style={{
                background: 'rgba(3,3,14,0.8)',
                border: `1px solid ${item.accent}18`,
                borderRadius: '3px',
              }}
            >
              {/* Corner accent */}
              <div
                className="h-px w-full mb-5"
                style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }}
              />
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-8 w-8 rounded-full flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${item.accent}cc, ${item.accent}44)`,
                    boxShadow: `0 0 14px ${item.accent}44`,
                  }}
                />
                <div>
                  <p className="text-sm font-bold text-text-base">{item.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: item.accent, opacity: 0.8 }}>
                    {item.category}
                  </p>
                </div>
              </div>
              <p className="text-xs font-semibold mb-2" style={{ color: item.accent }}>
                {item.headline}
              </p>
              <p className="text-xs text-text-muted leading-relaxed flex-1 mb-4">
                {item.summary}
              </p>
              <div className="flex items-end justify-between gap-3 mt-auto">
                <div className="flex gap-3">
                  {item.stats.map((s) => (
                    <div
                      key={s.label}
                      className="px-2.5 py-1.5 flex flex-col"
                      style={{
                        background: `${item.accent}08`,
                        border: `1px solid ${item.accent}18`,
                        borderRadius: '2px',
                      }}
                    >
                      <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: item.accent }}>{s.value}</span>
                      <span className="font-mono text-[9px] text-text-dim uppercase tracking-wider">{s.label}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/journal/${item.journalSlug}`}
                  className="flex items-center gap-1 font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors uppercase tracking-wider flex-shrink-0"
                >
                  <BookOpen size={10} />
                  Story
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-24 text-center mx-auto max-w-2xl">
        <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4">
          // ENGAGE
        </p>
        <h2 className="text-display-sm text-text-base mb-5">
          Ready to build something?
        </h2>
        <p className="text-text-muted leading-relaxed mb-8">
          If you have a product you want to build AI-first — properly, without shortcuts —
          we'd like to hear about it.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-7 py-3.5 font-mono text-sm font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-[1.02] uppercase tracking-wider"
          style={{ borderRadius: '3px' }}
        >
          Get in touch <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
