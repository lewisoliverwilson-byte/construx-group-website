import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Now',
  description: 'What the Construx Group team is focused on right now.',
};

const FOCUS_ITEMS = [
  {
    venture: 'Scoutr',
    accent: '#C8F50C',
    focus: 'Improving scan accuracy on edge-case product pages. Adding Walmart to the platform comparison.',
  },
  {
    venture: 'The Marqet',
    accent: '#3B82F6',
    focus: 'Growing the listing catalogue past 200. Adding MCP server category. Improving search and discovery.',
  },
  {
    venture: 'The Hyve',
    accent: '#8B5CF6',
    focus: 'Vector memory improvements. Better AI decision recall. Testing the latest Claude models for the agent layer.',
  },
  {
    venture: 'Construx Daily',
    accent: '#F59E0B',
    focus: 'Tuning the multi-agent pipeline voice. Growing the subscriber base. Daily issues shipping on schedule.',
  },
  {
    venture: 'Construx Studio',
    accent: '#06B6D4',
    focus: 'Taking on first client engagements. Lead Engine portal live for project intake.',
  },
];

const READING = [
  'Anthropic research on constitutional AI and agent alignment',
  'Gwern on scaling laws and prediction markets',
  'Reasoning model architecture papers',
  "The usual substacks: Ben Thompson, Matt Levine, Lenny's Newsletter",
];

export default function NowPage() {
  const updated = new Date();

  return (
    <div className="min-h-screen pt-36 pb-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Now</p>
          <h1 className="t-page mb-5">What&apos;s happening.</h1>
          <p className="t-meta">
            Updated {updated.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Current focus */}
        <section className="mb-16">
          <p className="t-eyebrow mb-6">Current focus</p>
          <div className="space-y-3">
            {FOCUS_ITEMS.map(({ venture, accent, focus }) => (
              <div
                key={venture}
                className="relative card overflow-hidden flex flex-col md:flex-row gap-4 px-7 py-5"
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: `linear-gradient(180deg, ${accent}, ${accent}30)` }}
                />
                <div className="flex-shrink-0 md:w-44">
                  <p className="t-card text-[14.5px] mb-1">{venture}</p>
                  <span
                    className="inline-flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-[0.14em]"
                    style={{ color: '#4ade80' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>
                <p className="t-body text-[13.5px] flex-1">{focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Thinking about */}
        <section className="mb-16">
          <p className="t-eyebrow mb-6">Thinking about</p>
          <div className="card p-8">
            <div className="space-y-5 t-body text-[14.5px]" style={{ lineHeight: 1.8 }}>
              <p>
                How fast model capabilities are compounding and what that means for the
                products we&apos;re building. The gap between what&apos;s theoretically
                possible and what builders are actually exploiting is genuinely large —
                and it&apos;s moving.
              </p>
              <p>
                The economics of AI-native businesses. Specifically: where the
                defensibility comes from once frontier model access is commoditised.
                Distribution, data, and network effects are the obvious answers, but the
                specifics vary significantly by product.
              </p>
              <p>
                Multi-agent architectures for creative and research tasks. Construx Daily
                is partly an experiment in what a well-designed agent pipeline can
                produce autonomously, without human editorial. The results so far are
                more interesting than expected.
              </p>
            </div>
          </div>
        </section>

        {/* Reading */}
        <section className="mb-16">
          <p className="t-eyebrow mb-6">Reading</p>
          <ul className="space-y-3">
            {READING.map((item) => (
              <li key={item} className="flex items-start gap-3 t-body text-[13.5px]">
                <span className="mt-[9px] w-1 h-1 rounded-full bg-white/25 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Context */}
        <section className="mb-14">
          <p className="t-eyebrow mb-6">Context</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Location', value: 'United Kingdom' },
              { label: 'Primary model', value: 'Claude' },
              { label: 'IDE', value: 'Claude Code' },
            ].map(({ label, value }) => (
              <div key={label} className="card px-5 py-5">
                <p className="t-meta mb-2" style={{ fontSize: 8.5 }}>{label}</p>
                <p className="t-card text-[15px]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-6">
          <Link href="/ventures" className="btn-text">
            Portfolio <ArrowRight size={12} />
          </Link>
          <Link href="/journal" className="btn-text">
            Journal <ArrowRight size={12} />
          </Link>
          <Link href="/contact" className="btn-text">
            Contact <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
