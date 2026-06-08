import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';

export const metadata: Metadata = {
  title: 'Now',
  description: 'What the Construx Group team is focused on right now.',
};

const FOCUS_ITEMS = [
  {
    venture: 'Construx Daily',
    accent: '#F59E0B',
    status: 'In Development',
    focus: 'Building the multi-agent pipeline. Getting the voice right — informative, precise, never generic AI-speak. First issue target: Q3 2026.',
  },
  {
    venture: 'Construx Studio',
    accent: '#06B6D4',
    status: 'In Development',
    focus: 'Finalising the public site and the Lead Engine portal for client onboarding. First client engagements opening Q3 2026.',
  },
  {
    venture: 'The Marqet',
    accent: '#3B82F6',
    status: 'Live',
    focus: 'Growing the listing catalogue past 200. Adding MCP server category. Improving search and discovery.',
  },
  {
    venture: 'Scoutr',
    accent: '#C8F50C',
    status: 'Live',
    focus: 'Improving scan accuracy on edge-case product pages. Adding Walmart to the platform comparison.',
  },
  {
    venture: 'The Hyve',
    accent: '#8B5CF6',
    status: 'Live',
    focus: 'Vector memory improvements. Better AI decision recall. Testing Claude Opus 4.8 for the agent layer.',
  },
];

const READING = [
  'Anthropic research on constitutional AI and agent alignment',
  'Gwern on scaling laws and prediction markets',
  'Reasoning model architecture papers (o3, Gemini 2.5)',
  'The usual substacks: Ben Thompson, Matt Levine, Lenny\'s Newsletter',
];

export default function NowPage() {
  const updated = new Date();

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">Now</p>
          <h1
            className="text-display text-white/90 mb-4"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            What's happening.
          </h1>
          <p className="font-mono text-[9px] text-white/22 uppercase tracking-[0.16em]">
            Updated {updated.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Current focus */}
        <section className="mb-14">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 mb-5">Current focus</p>
          <div className="space-y-3">
            {FOCUS_ITEMS.map(({ venture, accent, status, focus }) => (
              <div
                key={venture}
                className="glass rounded-lg px-6 py-5 flex flex-col md:flex-row gap-4"
                style={{ borderLeft: `3px solid ${accent}` }}
              >
                <div className="flex-shrink-0 md:w-44">
                  <p
                    className="text-[14px] text-white/78 mb-1"
                    style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                  >
                    {venture}
                  </p>
                  <span
                    className="font-mono text-[7.5px] uppercase tracking-[0.14em]"
                    style={{ color: status === 'Live' ? '#4ade80' : accent }}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-[13px] text-white/40 font-light leading-relaxed flex-1">{focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What I'm thinking about */}
        <section className="mb-14">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 mb-5">Thinking about</p>
          <div className="glass rounded-xl p-7">
            <div className="space-y-4 text-[14px] text-white/42 font-light leading-relaxed">
              <p>
                How fast model capabilities are compounding and what that means for the products we're building. The gap between what's theoretically possible and what builders are actually exploiting is genuinely large — and it's moving.
              </p>
              <p>
                The economics of AI-native businesses. Specifically: where the defensibility comes from once frontier model access is commoditised. Distribution, data, and network effects are the obvious answers, but the specifics vary significantly by product.
              </p>
              <p>
                Multi-agent architectures for creative and research tasks. Construx Daily is partly an experiment in what a well-designed agent pipeline can produce autonomously, without human editorial. The results so far are more interesting than expected.
              </p>
            </div>
          </div>
        </section>

        {/* Reading */}
        <section className="mb-14">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 mb-5">Reading</p>
          <ul className="space-y-2.5">
            {READING.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[13px] text-white/38 font-light">
                <span className="mt-2 w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Location / context */}
        <section className="mb-12">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 mb-5">Context</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Location', value: 'United Kingdom' },
              { label: 'Primary model', value: 'Claude Sonnet 4.6' },
              { label: 'IDE', value: 'Claude Code + Cursor' },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-md px-4 py-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22 mb-2">{label}</p>
                <p
                  className="text-[15px] text-white/72"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-5">
          <Link href="/ventures" className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/28 hover:text-white/55 transition-colors flex items-center gap-1.5">
            Portfolio <ArrowRight size={10} />
          </Link>
          <Link href="/journal" className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/28 hover:text-white/55 transition-colors flex items-center gap-1.5">
            Journal <ArrowRight size={10} />
          </Link>
          <Link href="/contact" className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/28 hover:text-white/55 transition-colors flex items-center gap-1.5">
            Contact <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}
