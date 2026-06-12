import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Uses',
  description: 'The tools and services Construx Group actually uses in production.',
};

const STACK = [
  {
    category: 'Core AI',
    items: [
      { name: 'Claude', desc: 'Primary model family for every production AI feature. Unmatched reasoning quality.', url: 'https://anthropic.com' },
      { name: 'Claude Opus', desc: 'Maximum reasoning depth — background agents and complex pipelines.', url: 'https://anthropic.com' },
      { name: 'Anthropic API', desc: 'Direct API access across all projects.', url: 'https://anthropic.com' },
    ],
  },
  {
    category: 'Framework',
    items: [
      { name: 'Next.js 15', desc: 'App Router, React Server Components, TypeScript. The standard for every web product.', url: 'https://nextjs.org' },
      { name: 'TypeScript', desc: 'Strict mode, always. Types are documentation and runtime safety in one.', url: 'https://typescriptlang.org' },
      { name: 'React 19', desc: 'Server and client components, concurrent features, stable hooks API.', url: 'https://react.dev' },
      { name: 'Tailwind CSS', desc: 'Utility-first styling. Fast to write, easy to maintain.', url: 'https://tailwindcss.com' },
    ],
  },
  {
    category: 'Infrastructure',
    items: [
      { name: 'AWS Amplify', desc: 'Hosting and CI/CD. Auto-deploy from GitHub on push.', url: 'https://aws.amazon.com/amplify' },
      { name: 'AWS CDK', desc: 'Infrastructure as code — Lambdas, databases, API gateways in TypeScript.', url: 'https://aws.amazon.com/cdk' },
      { name: 'PostgreSQL + pgvector', desc: 'Relational data with vector embeddings for semantic search.', url: null },
      { name: 'Supabase', desc: 'Managed Postgres with realtime subscriptions. Powers The Hyve.', url: 'https://supabase.com' },
    ],
  },
  {
    category: 'Tooling',
    items: [
      { name: 'Claude Code', desc: "Anthropic's CLI for agentic engineering. Most of the studio's code is written through it.", url: 'https://claude.ai/code' },
      { name: 'GitHub', desc: 'Source control and CI. Every project has its own repo.', url: 'https://github.com' },
      { name: 'Resend', desc: 'Transactional email. Clean API, excellent deliverability.', url: 'https://resend.com' },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <p className="t-eyebrow mb-5">Uses</p>
          <h1 className="t-page mb-7">The toolkit.</h1>
          <p className="t-lead" style={{ maxWidth: '50ch' }}>
            What the studio actually uses in production. No fluff — if it&apos;s
            listed here, it&apos;s carrying real weight.
          </p>
        </div>

        <div className="title-rule mb-0" />

        {/* Stack */}
        {STACK.map(({ category, items }) => (
          <section key={category} className="border-b" style={{ borderColor: 'var(--hairline)' }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-12">
              <div className="md:col-span-3">
                <p className="t-eyebrow">{category}</p>
              </div>
              <div className="md:col-span-9">
                {items.map(({ name, desc, url }, i) => (
                  <div
                    key={name}
                    className="flex items-baseline gap-6 py-4"
                    style={{ borderTop: i > 0 ? '1px solid var(--hairline)' : 'none' }}
                  >
                    <div className="w-44 flex-shrink-0">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="t-card text-[15px] inline-flex items-center gap-1.5 hover:underline"
                          style={{ textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
                        >
                          {name} <ArrowUpRight size={11} style={{ color: 'var(--ink-faint)' }} />
                        </a>
                      ) : (
                        <span className="t-card text-[15px]">{name}</span>
                      )}
                    </div>
                    <p className="t-body text-[14px]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Note */}
        <div className="mt-14">
          <p className="t-body mb-6" style={{ maxWidth: '56ch' }}>
            The toolkit evolves as capability changes. Claude Code wrote the majority
            of this site — including this page.
          </p>
          <Link href="/blog" className="btn-text">
            How we build <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
