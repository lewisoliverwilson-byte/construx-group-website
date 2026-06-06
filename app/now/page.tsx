import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Now',
  description: 'What Construx Group is working on right now.',
  alternates: { canonical: 'https://construxgroup.io/now' },
};

const LAST_UPDATED = 'June 2026';

const nowItems = [
  {
    category: 'PRODUCTS',
    items: [
      {
        title: 'Scoutr: professional user optimisation',
        body: 'Iterating on the batch output view based on usage from professional arbitrage traders. Working on better sorting controls and a faster scan mechanism for multi-page retailers.',
        status: 'IN PROGRESS',
      },
      {
        title: 'The Marqet: taxonomy refinement',
        body: 'Reviewing the four-category browse structure against real usage data. Some professional roles are underrepresented; expanding those verticals.',
        status: 'IN PROGRESS',
      },
      {
        title: 'The Hyve: AI context improvements',
        body: 'Improving the context pipeline for the AI agent — better retrieval of relevant past decisions, smarter truncation for long channel histories.',
        status: 'IN PROGRESS',
      },
    ],
  },
  {
    category: 'INFRASTRUCTURE',
    items: [
      {
        title: 'RESEND_API_KEY configuration',
        body: 'Setting up the Resend API key in Amplify so the contact form actually sends emails. Currently gracefully failing silently — forms are accepted but emails not delivered.',
        status: 'PENDING',
      },
      {
        title: 'NEXT_PUBLIC_SITE_URL in Amplify',
        body: 'Configuring the site URL env var for canonical URL generation and dynamic OG images to use the correct domain.',
        status: 'PENDING',
      },
    ],
  },
  {
    category: 'JOURNAL',
    items: [
      {
        title: '47+ dispatches and continuing',
        body: 'Building the journal toward 50 dispatches. Writing about what we actually do — build decisions, product thinking, technical approaches. The journal is the most effective thing we do for acquisition.',
        status: 'ONGOING',
      },
    ],
  },
  {
    category: 'EXPLORING',
    items: [
      {
        title: 'A fourth venture',
        body: "Running the 48-hour validation process on a few ideas. Nothing ready to announce. The signals we're watching: where professional workflows are still manual, where AI can replace calculation rather than just assist it.",
        status: 'RESEARCH',
      },
    ],
  },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'IN PROGRESS': { bg: 'rgba(249,115,22,0.1)', text: '#F97316' },
  'PENDING': { bg: 'rgba(234,179,8,0.1)', text: 'rgba(234,179,8,0.8)' },
  'ONGOING': { bg: 'rgba(34,197,94,0.1)', text: 'rgba(34,197,94,0.8)' },
  'RESEARCH': { bg: 'rgba(168,85,247,0.1)', text: 'rgba(168,85,247,0.8)' },
};

export default function NowPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-12 px-5 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors mb-8 group uppercase tracking-widest"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            // HOME
          </Link>
          <p className="font-mono text-[9px] text-construx uppercase tracking-[0.25em] mb-3">// CURRENT STATUS</p>
          <h1 className="text-display-sm text-text-base mb-4 leading-tight">Now</h1>
          <p className="text-text-muted leading-relaxed text-base max-w-2xl">
            What we&apos;re working on right now. Inspired by{' '}
            <a
              href="https://nownownow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-construx hover:text-orange-400 transition-colors underline underline-offset-2"
              style={{ textDecorationColor: 'rgba(249,115,22,0.3)' }}
            >
              nownownow.com
            </a>
            .
          </p>
          <p className="font-mono text-[10px] text-text-dim mt-3 uppercase tracking-widest">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="px-5 py-16 mx-auto max-w-3xl">
        <div className="space-y-12">
          {nowItems.map((section) => (
            <section key={section.category}>
              <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-construx/70 mb-5 flex items-center gap-3">
                <span>// {section.category}</span>
                <span className="flex-1 h-px" style={{ background: 'rgba(249,115,22,0.12)' }} />
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => {
                  const colors = STATUS_COLORS[item.status] ?? { bg: 'rgba(255,255,255,0.05)', text: 'rgba(240,239,255,0.5)' };
                  return (
                    <div
                      key={item.title}
                      className="px-5 py-4"
                      style={{
                        background: 'rgba(5,5,18,0.5)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '3px',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-text-base leading-snug">{item.title}</h3>
                        <span
                          className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 flex-shrink-0"
                          style={{
                            background: colors.bg,
                            color: colors.text,
                            borderRadius: '2px',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            Want to know more?{' '}
            <Link href="/journal" className="text-construx hover:text-orange-400 transition-colors">
              Read the journal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
