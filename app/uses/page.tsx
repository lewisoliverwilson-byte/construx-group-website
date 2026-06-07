import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import NeofetchPanel from '@/components/NeofetchPanel';
import BrewListPanel from '@/components/BrewListPanel';
import VscodeExtensionsPanel from '@/components/VscodeExtensionsPanel';
import LshwPanel from '@/components/LshwPanel';
import TmuxSessionsPanel from '@/components/TmuxSessionsPanel';
import SshConfigPanel from '@/components/SshConfigPanel';
import NpmGlobalPanel from '@/components/NpmGlobalPanel';
import GitConfigPanel from '@/components/GitConfigPanel';
import EnvPanel from '@/components/EnvPanel';
import LsofPanel from '@/components/LsofPanel';
import NpmOutdatedPanel from '@/components/NpmOutdatedPanel';
import LokiQueryPanel from '@/components/LokiQueryPanel';
import NixShellPanel from '@/components/NixShellPanel';
import TurboRepoPanel from '@/components/TurboRepoPanel';
import OAuthFlowPanel from '@/components/OAuthFlowPanel';
import KafkaStreamsPanel from '@/components/KafkaStreamsPanel';
import GrpcurlPanel from '@/components/GrpcurlPanel';
import GitWorktreePanel from '@/components/GitWorktreePanel';
import MisePanel from '@/components/MisePanel';
import ActPanel from '@/components/ActPanel';
import KarpenterPanel from '@/components/KarpenterPanel';
import OpenFgaPanel from '@/components/OpenFgaPanel';
import ScyllaDbPanel from '@/components/ScyllaDbPanel';
import QdrantPanel from '@/components/QdrantPanel';
import OpenSearchPanel from '@/components/OpenSearchPanel';
import TalosPanel from '@/components/TalosPanel';
import GatekeeperPanel from '@/components/GatekeeperPanel';
import HubblePanel from '@/components/HubblePanel';

export const metadata: Metadata = {
  title: 'Uses',
  description: 'The tools, services, and stack behind Construx Group and its ventures.',
  alternates: { canonical: 'https://construxgroup.io/uses' },
};

interface UseItem {
  name: string;
  description: string;
  url?: string;
  tag?: string;
}

interface UseSection {
  id: string;
  label: string;
  items: UseItem[];
}

const sections: UseSection[] = [
  {
    id: 'ai',
    label: 'AI',
    items: [
      { name: 'Claude (Anthropic)', description: 'Primary model for all product AI features — Sonnet 4.6 for latency-sensitive calls, Opus for complex reasoning tasks.', url: 'https://anthropic.com', tag: 'Core' },
      { name: 'Claude Code', description: 'CLI-based AI coding assistant. The entire Construx Group stack was built with Claude Code.', tag: 'Core' },
      { name: 'Claude Projects', description: 'Used for persistent-context work sessions and for The Marqet product (which sells Claude configurations for Projects).', tag: 'Core' },
    ],
  },
  {
    id: 'stack',
    label: 'Stack',
    items: [
      { name: 'Next.js 15', description: 'App Router with React Server Components. Used for all three products and this site.', url: 'https://nextjs.org', tag: 'Framework' },
      { name: 'React 19', description: 'Server and client components, concurrent features.', tag: 'Framework' },
      { name: 'TypeScript', description: 'Strict mode. Non-negotiable for production code.', tag: 'Language' },
      { name: 'Tailwind CSS 3', description: 'Utility-first styling. No component library — we write our own components.', url: 'https://tailwindcss.com', tag: 'Styling' },
      { name: 'PostgreSQL + pgvector', description: 'Database for The Hyve. pgvector extension for vector embeddings alongside relational data.', tag: 'Database' },
      { name: 'Three.js + React Three Fiber', description: 'The solar system hero on this site. R3F wraps Three.js in a declarative React API.', tag: '3D' },
      { name: 'MDX + next-mdx-remote', description: 'Content format for the journal. Posts are MDX files in the repo, rendered server-side.', tag: 'Content' },
      { name: 'BullMQ', description: 'Redis-backed job queue for background processing — Scoutr product scans, AI response generation, content moderation pipelines.', url: 'https://bullmq.io', tag: 'Queue' },
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    items: [
      { name: 'AWS Amplify', description: 'Hosting for all three products and this site. Auto-deploys from GitHub master on every push.', url: 'https://aws.amazon.com/amplify', tag: 'Hosting' },
      { name: 'GitHub', description: 'Source control. One repo per product. Master branch is always deployable.', url: 'https://github.com', tag: 'Source Control' },
      { name: 'Railway', description: 'The Hyve\'s real-time backend (WebSocket server, background jobs). Persistent services alongside Amplify\'s serverless functions.', url: 'https://railway.app', tag: 'Backend' },
      { name: 'Resend', description: 'Transactional email. Used for contact form emails and product notifications.', url: 'https://resend.com', tag: 'Email' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { name: 'PostHog', description: 'Product analytics across all products. Events, funnels, session recordings. Self-hosted option makes GDPR straightforward.', url: 'https://posthog.com', tag: 'Analytics' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { name: 'VS Code', description: 'Primary editor. With Claude Code extension for AI-assisted development.', url: 'https://code.visualstudio.com', tag: 'Editor' },
      { name: 'Figma', description: 'Design when we use it — mostly for venture brand assets. The site was designed in code.', url: 'https://figma.com', tag: 'Design' },
      { name: 'Linear', description: 'Issue tracking for The Hyve development. For smaller projects we use The Hyve\'s own kanban boards.', url: 'https://linear.app', tag: 'Project Management' },
      { name: 'Notion', description: 'Documentation, meeting notes, decision records that predate The Hyve.', url: 'https://notion.so', tag: 'Docs' },
    ],
  },
  {
    id: 'hardware',
    label: 'Hardware',
    items: [
      { name: 'MacBook Pro M3 Pro', description: 'Primary development machine. The M3 Pro handles Three.js development without fans. 18GB unified memory.', tag: 'Primary' },
      { name: 'Dell U2722D', description: '27" 4K monitor. The extra resolution matters for reading dense code.', tag: 'Display' },
      { name: 'Keychron Q1 Pro', description: 'Wireless mechanical keyboard. QMK firmware, Gateron G Pro switches.', tag: 'Input' },
    ],
  },
];

const TAG_COLORS: Record<string, string> = {
  Core: 'rgba(249,115,22,0.15)',
  Framework: 'rgba(59,130,246,0.12)',
  Language: 'rgba(168,85,247,0.12)',
  Styling: 'rgba(20,184,166,0.12)',
  Database: 'rgba(234,179,8,0.12)',
  '3D': 'rgba(249,115,22,0.12)',
  Content: 'rgba(34,197,94,0.12)',
  Queue: 'rgba(234,179,8,0.12)',
  Hosting: 'rgba(249,115,22,0.12)',
  'Source Control': 'rgba(240,239,255,0.06)',
  Backend: 'rgba(59,130,246,0.12)',
  Email: 'rgba(240,239,255,0.06)',
  Analytics: 'rgba(168,85,247,0.12)',
  Editor: 'rgba(59,130,246,0.12)',
  Design: 'rgba(20,184,166,0.12)',
  'Project Management': 'rgba(234,179,8,0.12)',
  Docs: 'rgba(240,239,255,0.06)',
  Primary: 'rgba(240,239,255,0.06)',
  Display: 'rgba(240,239,255,0.06)',
  Input: 'rgba(240,239,255,0.06)',
};

const SECTION_ACCENTS: Record<string, { accent: string; dim: string }> = {
  ai:             { accent: '#F97316', dim: 'rgba(249,115,22,0.18)' },
  stack:          { accent: '#3B82F6', dim: 'rgba(59,130,246,0.16)' },
  infrastructure: { accent: '#67e8f9', dim: 'rgba(103,232,249,0.15)' },
  analytics:      { accent: '#a78bfa', dim: 'rgba(167,139,250,0.16)' },
  tools:          { accent: '#4ade80', dim: 'rgba(74,222,128,0.14)' },
  hardware:       { accent: 'rgba(240,239,255,0.6)', dim: 'rgba(255,255,255,0.08)' },
};

export default function UsesPage() {
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
          <p className="font-mono text-[9px] text-construx uppercase tracking-[0.25em] mb-3">// STACK + TOOLS</p>
          <h1 className="text-display-sm text-text-base mb-4 leading-tight">What we use</h1>
          <p className="text-text-muted leading-relaxed text-base max-w-2xl">
            The tools, services, and hardware behind Construx Group and its ventures.
            Last updated May 2027.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="px-5 py-16 mx-auto max-w-3xl">
        {/* Section nav — terminal panel */}
        <div
          className="mb-12 overflow-hidden"
          style={{
            background: 'rgba(2,2,12,0.9)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '4px',
          }}
        >
          {/* title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,8,0.5)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="flex-1 text-center font-mono text-[10px] text-text-dim/40 uppercase tracking-[0.2em]">
              sys.stack — jump to section
            </span>
            <span className="font-mono text-[9px] text-text-dim/25 uppercase tracking-widest">
              {sections.length} modules
            </span>
          </div>
          {/* Shell prompt */}
          <div
            className="px-4 py-1.5 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
          >
            <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
              construx@sys:~$
            </span>
            <span className="font-mono text-[9px]" style={{ color: 'rgba(240,239,255,0.22)' }}>
              {' '}ls /var/construx/uses/
            </span>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 transition-colors"
                style={{
                  background: 'rgba(5,5,18,0.8)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '2px',
                  color: 'rgba(240,239,255,0.45)',
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section) => {
            const { accent, dim } = SECTION_ACCENTS[section.id] ?? { accent: '#F97316', dim: 'rgba(249,115,22,0.15)' };
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 overflow-hidden"
                style={{
                  background: 'rgba(3,3,14,0.85)',
                  border: `1px solid ${dim}`,
                  borderRadius: '4px',
                  boxShadow: `0 0 30px ${accent}08`,
                }}
              >
                {/* Terminal title bar */}
                <div
                  className="flex items-center gap-3 px-4 py-2.5 select-none"
                  style={{ borderBottom: `1px solid ${dim}`, background: `${accent}06` }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                  </div>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center"
                    style={{ color: `${accent}55` }}
                  >
                    construx.uses — {section.label.toLowerCase()} · {section.items.length} {section.items.length === 1 ? 'tool' : 'tools'}
                  </span>
                  <span
                    className="font-mono text-[8px] uppercase tracking-widest"
                    style={{ color: 'rgba(74,222,128,0.45)' }}
                  >
                    ● active
                  </span>
                </div>

                {/* Shell prompt line */}
                <div
                  className="flex items-center gap-2 px-5 py-2 font-mono text-[10px]"
                  style={{ borderBottom: `1px solid ${dim}`, background: 'rgba(0,0,6,0.3)' }}
                >
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@sys</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
                  <span style={{ color: 'rgba(240,239,255,0.28)' }}>
                    cat /var/construx/uses/{section.id}.json
                  </span>
                </div>

                {/* Items */}
                <div>
                  {section.items.map((item, i) => (
                    <div
                      key={item.name}
                      className="flex items-start gap-4 px-5 py-4 group"
                      style={{
                        borderBottom: i < section.items.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                      }}
                    >
                      <div className="flex-shrink-0 font-mono text-[9px] tabular-nums mt-0.5" style={{ color: `${accent}40`, minWidth: '1.5rem' }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm font-semibold text-text-base hover:text-construx transition-colors"
                            >
                              {item.name}
                              <ExternalLink size={11} className="opacity-30 group-hover:opacity-60 transition-opacity" />
                            </a>
                          ) : (
                            <span className="text-sm font-semibold text-text-base">{item.name}</span>
                          )}
                          {item.tag && (
                            <span
                              className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5"
                              style={{
                                background: TAG_COLORS[item.tag] ?? 'rgba(255,255,255,0.06)',
                                color: 'rgba(240,239,255,0.4)',
                                borderRadius: '2px',
                              }}
                            >
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status footer */}
                <div
                  className="flex items-center justify-between px-4 py-1.5"
                  style={{ borderTop: `1px solid ${dim}`, background: 'rgba(0,0,4,0.35)' }}
                >
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: `${accent}30` }}>
                    {section.id}.module
                  </span>
                  <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.1)' }}>
                    {section.items.length} entries
                  </span>
                </div>
              </section>
            );
          })}
        </div>

        {/* Dev machine system info */}
        <div className="mt-8">
          <NeofetchPanel />
        </div>

        {/* Homebrew packages */}
        <div className="mt-6">
          <BrewListPanel />
        </div>

        {/* VS Code extensions */}
        <div className="mt-6">
          <VscodeExtensionsPanel />
        </div>

        {/* Server hardware info */}
        <div className="mt-6">
          <LshwPanel />
        </div>

        {/* Tmux sessions */}
        <div className="mt-6">
          <TmuxSessionsPanel />
        </div>

        {/* SSH config */}
        <div className="mt-6">
          <SshConfigPanel />
        </div>

        {/* Global npm packages */}
        <div className="mt-6">
          <NpmGlobalPanel />
        </div>

        {/* Git global config */}
        <div className="mt-6 pb-6">
          <GitConfigPanel />
        </div>

        {/* Environment variables */}
        <div className="mt-6 pb-6">
          <EnvPanel />
        </div>

        {/* Open network file descriptors */}
        <div className="mt-6 pb-6">
          <LsofPanel />
        </div>

        {/* npm outdated — dependency freshness */}
        <div className="mt-6 pb-6">
          <NpmOutdatedPanel />
        </div>

        {/* Grafana Loki log query */}
        <div className="mt-6 pb-6">
          <LokiQueryPanel />
        </div>

        {/* Nix dev shell */}
        <div className="mt-6 pb-6">
          <NixShellPanel />
        </div>

        {/* Turborepo monorepo build pipeline */}
        <div className="mt-6 pb-6">
          <TurboRepoPanel />
        </div>

        {/* OAuth 2.0 + PKCE authorization flow */}
        <div className="mt-6 pb-6">
          <OAuthFlowPanel />
        </div>

        {/* Kafka Streams topology */}
        <div className="mt-6 pb-6">
          <KafkaStreamsPanel />
        </div>

        {/* gRPC service inspection with grpcurl */}
        <div className="mt-6 pb-6">
          <GrpcurlPanel />
        </div>

        {/* git worktree parallel branch checkouts */}
        <div className="mt-6 pb-6">
          <GitWorktreePanel />
        </div>

        {/* mise polyglot tool version manager */}
        <div className="mt-6 pb-6">
          <MisePanel />
        </div>

        {/* act: run GitHub Actions workflows locally */}
        <div className="mt-6 pb-6">
          <ActPanel />
        </div>

        {/* karpenter node autoscaler by workload shape */}
        <div className="mt-6 pb-6">
          <KarpenterPanel />
        </div>

        {/* openfga fine-grained authorization — zanzibar model */}
        <div className="mt-6 pb-6">
          <OpenFgaPanel />
        </div>

        {/* scylladb wide-column cassandra — shard-per-core, no gc, p99 latency */}
        <div className="mt-6 pb-6">
          <ScyllaDbPanel />
        </div>

        {/* qdrant vector database — hnsw ann, hybrid bm25+dense, payload filtering */}
        <div className="mt-6 pb-6">
          <QdrantPanel />
        </div>

        {/* opensearch distributed search — inverted index, query dsl, bm25, vector */}
        <div className="mt-6 pb-6">
          <OpenSearchPanel />
        </div>

        {/* talos linux immutable kubernetes os — no ssh, api-driven, atomic upgrade */}
        <div className="mt-6 pb-6">
          <TalosPanel />
        </div>

        {/* opa gatekeeper admission control — constraints, rego, audit, violations */}
        <div className="mt-6 pb-6">
          <GatekeeperPanel />
        </div>

        {/* hubble cilium network observability — flows, drops, policy verdicts, service map */}
        <div className="mt-6 pb-10">
          <HubblePanel />
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
            Build something with a similar stack?{' '}
            <Link href="/work-with-us" className="text-construx hover:text-orange-400 transition-colors">
              Talk to us →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
