import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Uses',
  description: 'The tools, hardware, and services we use to build Construx Group ventures.',
};

const STACK = [
  {
    category: 'Core AI',
    accent: '#8B5CF6',
    items: [
      { name: 'Claude Sonnet 4.6', desc: 'Primary model for all production AI features. Unmatched reasoning quality for complex tasks.', url: 'https://anthropic.com' },
      { name: 'Claude Opus 4.8', desc: 'For tasks requiring maximum reasoning depth. Background agents and complex pipelines.', url: 'https://anthropic.com' },
      { name: 'Anthropic API', desc: 'Direct API access — claude-sonnet-4-6 and claude-opus-4-8 across all ventures.', url: 'https://anthropic.com' },
    ],
  },
  {
    category: 'Framework',
    accent: '#3B82F6',
    items: [
      { name: 'Next.js 15', desc: 'App Router, React Server Components, TypeScript. Our standard for every web product.', url: 'https://nextjs.org' },
      { name: 'TypeScript', desc: 'Strict mode, always. Types are documentation and runtime safety in one.', url: 'https://typescriptlang.org' },
      { name: 'React 19', desc: 'Server and client components, concurrent features, stable hooks API.', url: 'https://react.dev' },
      { name: 'Tailwind CSS 3', desc: 'Utility-first styling. Fast to write, easy to maintain, no CSS files.', url: 'https://tailwindcss.com' },
    ],
  },
  {
    category: 'Infrastructure',
    accent: '#C8F50C',
    items: [
      { name: 'AWS Amplify', desc: 'Hosting and CI/CD for all ventures. Auto-deploy from GitHub on push.', url: 'https://aws.amazon.com/amplify' },
      { name: 'AWS CDK', desc: 'Infrastructure as code. Lambdas, databases, and API gateways defined in TypeScript.', url: 'https://aws.amazon.com/cdk' },
      { name: 'PostgreSQL + pgvector', desc: 'Relational database with vector embeddings for semantic search across all AI products.', url: null },
      { name: 'Supabase', desc: 'Managed Postgres with realtime subscriptions. Powers The Hyve workspace.', url: 'https://supabase.com' },
    ],
  },
  {
    category: 'Tooling',
    accent: '#06B6D4',
    items: [
      { name: 'Claude Code', desc: "Anthropic's CLI for agentic coding. Used for most of the Construx Group build.", url: 'https://claude.ai/code' },
      { name: 'Cursor', desc: 'IDE with deep AI integration. Good for targeted edits and refactors.', url: 'https://cursor.sh' },
      { name: 'GitHub', desc: 'Source control and CI. Every venture has its own private repo.', url: 'https://github.com' },
      { name: 'Resend', desc: 'Transactional email. Clean API, excellent deliverability.', url: 'https://resend.com' },
    ],
  },
  {
    category: '3D / Animation',
    accent: '#F59E0B',
    items: [
      { name: 'Three.js + R3F', desc: 'React Three Fiber for 3D scenes. Powers the venture hero on this site.', url: 'https://threejs.org' },
      { name: 'Framer Motion', desc: 'Page transitions and micro-interactions. Used across all sites.', url: 'https://framer.com/motion' },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">

        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/28 mb-4">Stack</p>
          <h1
            className="text-display text-white/90 mb-5"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            What we use.
          </h1>
          <p className="text-[15px] text-white/40 font-light max-w-lg leading-relaxed">
            The tools, frameworks, and services powering every Construx Group venture. No fluff — these are the things we actually use in production.
          </p>
        </div>

        {/* Stack categories */}
        <div className="space-y-10">
          {STACK.map(({ category, accent, items }) => (
            <section key={category}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
                <p
                  className="text-[16px] text-white/72"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                >
                  {category}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(({ name, desc, url }) => (
                  <div
                    key={name}
                    className="glass rounded-md p-5 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p
                        className="text-[15px] text-white/80"
                        style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                      >
                        {name}
                      </p>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/18 hover:text-white/50 transition-colors flex-shrink-0 ml-2"
                        >
                          <ArrowUpRight size={13} />
                        </a>
                      )}
                    </div>
                    <p className="text-[12.5px] text-white/35 font-light leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Note */}
        <div className="mt-14 pt-8 border-t border-border">
          <p className="text-[13px] text-white/28 font-light max-w-xl leading-relaxed">
            This stack evolves as capabilities change. Claude Code handles the majority of the build work. The entire Construx Group website was built with it.
          </p>
          <Link
            href="/journal"
            className="mt-4 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/28 hover:text-white/55 transition-colors"
          >
            Read about how we build →
          </Link>
        </div>
      </div>
    </div>
  );
}
