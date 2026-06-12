import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Uses',
  description: 'The tools, hardware, and services we use to build Construx Group ventures.',
};

const STACK = [
  {
    category: 'Core AI',
    accent: '#8B5CF6',
    items: [
      { name: 'Claude', desc: 'Primary model family for all production AI features. Unmatched reasoning quality for complex tasks.', url: 'https://anthropic.com' },
      { name: 'Claude Opus', desc: 'For tasks requiring maximum reasoning depth. Background agents and complex pipelines.', url: 'https://anthropic.com' },
      { name: 'Anthropic API', desc: 'Direct API access across all ventures.', url: 'https://anthropic.com' },
    ],
  },
  {
    category: 'Framework',
    accent: '#3B82F6',
    items: [
      { name: 'Next.js 15', desc: 'App Router, React Server Components, TypeScript. Our standard for every web product.', url: 'https://nextjs.org' },
      { name: 'TypeScript', desc: 'Strict mode, always. Types are documentation and runtime safety in one.', url: 'https://typescriptlang.org' },
      { name: 'React 19', desc: 'Server and client components, concurrent features, stable hooks API.', url: 'https://react.dev' },
      { name: 'Tailwind CSS', desc: 'Utility-first styling. Fast to write, easy to maintain.', url: 'https://tailwindcss.com' },
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
      { name: 'Three.js + R3F', desc: 'React Three Fiber for 3D scenes. Powers the venture map on this site.', url: 'https://threejs.org' },
      { name: 'Framer Motion', desc: 'Page transitions and micro-interactions. Used across all sites.', url: 'https://framer.com/motion' },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="min-h-screen pt-36 pb-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-20">
          <p className="t-eyebrow mb-5">Stack</p>
          <h1 className="t-page mb-6">What we use.</h1>
          <p className="t-lead max-w-lg">
            The tools, frameworks, and services powering every Construx Group venture.
            No fluff — these are the things we actually use in production.
          </p>
        </div>

        {/* Stack categories */}
        <div className="space-y-14">
          {STACK.map(({ category, accent, items }) => (
            <section key={category}>
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: accent, boxShadow: `0 0 8px ${accent}80` }}
                />
                <p className="t-card text-[17px]">{category}</p>
                <div className="flex-1 hairline" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(({ name, desc, url }) => (
                  <div key={name} className="card card-hover p-6 group">
                    <div className="flex items-start justify-between mb-2.5">
                      <p className="t-card text-[15px]">{name}</p>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0 ml-2"
                          aria-label={`Visit ${name}`}
                        >
                          <ArrowUpRight size={13} />
                        </a>
                      )}
                    </div>
                    <p className="t-body text-[13px]">{desc}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Note */}
        <div className="mt-16 pt-10 border-t border-border">
          <p className="t-body max-w-xl mb-5">
            This stack evolves as capabilities change. Claude Code handles the majority
            of the build work. The entire Construx Group website was built with it.
          </p>
          <Link href="/journal" className="btn-text">
            Read about how we build <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
