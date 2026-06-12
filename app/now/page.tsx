import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Now',
  description: 'What the studio is focused on right now.',
};

const FOCUS_ITEMS = [
  {
    project: 'Scoutr',
    focus: 'Improving scan accuracy on edge-case product pages. Adding Walmart to the platform comparison.',
  },
  {
    project: 'The Marqet',
    focus: 'Growing the listing catalogue past 200. Adding an MCP server category. Improving search and discovery.',
  },
  {
    project: 'The Hyve',
    focus: 'Vector memory improvements. Better AI decision recall. Testing the latest Claude models for the agent layer.',
  },
  {
    project: 'Construx Daily',
    focus: 'Tuning the multi-agent pipeline voice. Growing the subscriber base. Daily issues shipping on schedule.',
  },
  {
    project: 'Construx Studio',
    focus: 'Taking on first client engagements. Lead Engine portal live for project intake.',
  },
];

const READING = [
  'Anthropic research on constitutional AI and agent alignment',
  'Gwern on scaling laws and prediction markets',
  'Reasoning model architecture papers',
  "The usual: Ben Thompson, Matt Levine, Lenny's Newsletter",
];

export default function NowPage() {
  const updated = new Date();

  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Now</p>
          <h1 className="t-page mb-6">Current state.</h1>
          <p className="t-meta">
            Updated {updated.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="title-rule mb-16" />

        {/* Focus */}
        <section className="mb-20">
          <p className="t-eyebrow mb-2">Active work</p>
          <div className="border-t mt-6" style={{ borderColor: 'var(--hairline)' }}>
            {FOCUS_ITEMS.map(({ project, focus }, i) => (
              <div
                key={project}
                className="grid grid-cols-12 gap-4 py-6 border-b"
                style={{ borderColor: 'var(--hairline)' }}
              >
                <span className="col-span-1 font-mono text-[11px] tabular-nums pt-0.5" style={{ color: 'var(--ink-faint)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="col-span-11 md:col-span-3">
                  <p className="t-card text-[16px] mb-1.5">{project}</p>
                  <span className="flex items-center gap-2 t-meta" style={{ fontSize: 9.5 }}>
                    <span className="dot-live" style={{ width: 5, height: 5 }} />
                    Live
                  </span>
                </div>
                <p className="col-span-11 col-start-2 md:col-span-8 md:col-start-5 t-body text-[14.5px]">{focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Thinking about */}
        <section className="mb-20">
          <p className="t-eyebrow mb-8">Thinking about</p>
          <div className="space-y-5 t-body text-[15.5px]" style={{ maxWidth: '62ch', lineHeight: 1.78 }}>
            <p>
              How fast model capability is compounding and what that means for what we
              build next. The gap between what&apos;s theoretically possible and what
              builders are actually exploiting is genuinely large — and moving.
            </p>
            <p>
              The economics of AI-native businesses: where defensibility comes from
              once frontier model access is commoditised. Distribution, data, and
              network effects are the obvious answers; the specifics vary by product.
            </p>
            <p>
              Multi-agent architectures for creative and research work. Construx Daily
              is partly an experiment in what a well-designed pipeline produces
              without human editorial. The results are more interesting than expected.
            </p>
          </div>
        </section>

        {/* Reading */}
        <section className="mb-20">
          <p className="t-eyebrow mb-6">Reading</p>
          <ul className="space-y-3">
            {READING.map((item) => (
              <li key={item} className="flex items-start gap-4 t-body text-[14.5px]">
                <span className="font-mono text-[11px] pt-1" style={{ color: 'var(--ink-faint)' }}>—</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Context strip */}
        <section className="mb-14">
          <div className="title-rule mb-5" style={{ maxWidth: 120 }} />
          <div className="flex flex-wrap gap-x-12 gap-y-3">
            <span className="t-fact"><span className="t-meta mr-2.5" style={{ fontSize: 10 }}>Base</span>United Kingdom</span>
            <span className="t-fact"><span className="t-meta mr-2.5" style={{ fontSize: 10 }}>Engine</span>Claude</span>
            <span className="t-fact"><span className="t-meta mr-2.5" style={{ fontSize: 10 }}>Tooling</span>Claude Code</span>
          </div>
        </section>

        <div className="pt-8 border-t flex flex-wrap gap-7" style={{ borderColor: 'var(--hairline)' }}>
          <Link href="/ventures" className="btn-text">
            The manifest <ArrowRight size={11} />
          </Link>
          <Link href="/blog" className="btn-text">
            Journal <ArrowRight size={11} />
          </Link>
          <Link href="/contact" className="btn-text">
            Contact <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
