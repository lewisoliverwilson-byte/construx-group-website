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
import GVisorPanel from '@/components/GVisorPanel';
import NomadPanel from '@/components/NomadPanel';
import KubeProxyPanel from '@/components/KubeProxyPanel';
import SonarQubePanel from '@/components/SonarQubePanel';
import KedaPanel from '@/components/KedaPanel';
import ZarfPanel from '@/components/ZarfPanel';
import BiomePanel from '@/components/BiomePanel';
import RabbitMQPanel from '@/components/RabbitMQPanel';
import SocketPanel from '@/components/SocketPanel';
import PixiePanel from '@/components/PixiePanel';
import NatsPanel from '@/components/NatsPanel';
import EnvoyPanel from '@/components/EnvoyPanel';
import LinkerdPanel from '@/components/LinkerdPanel';
import ClickHousePanel from '@/components/ClickHousePanel';
import EtcdPanel from '@/components/EtcdPanel';
import KindPanel from '@/components/KindPanel';
import KubeStateMetricsPanel from '@/components/KubeStateMetricsPanel';
import OpenFGAPanel from '@/components/OpenFGAPanel';
import KafkaConnectPanel from '@/components/KafkaConnectPanel';
import SpiceDBPanel from '@/components/SpiceDBPanel';
import StrimziPanel from '@/components/StrimziPanel';
import TypesensePanel from '@/components/TypesensePanel';
import DuckdbPanel from '@/components/DuckdbPanel';
import RekorPanel from '@/components/RekorPanel';
import SigstorePanel from '@/components/SigstorePanel';
import WebVitalsPanel from '@/components/WebVitalsPanel';
import DmesgPanel from '@/components/DmesgPanel';
import AirbytePanel from '@/components/AirbytePanel';
import NATSJetStreamPanel from '@/components/NATSJetStreamPanel';
import DaprPanel from '@/components/DaprPanel';
import AirflowPanel from '@/components/AirflowPanel';
import CiliumPanel from '@/components/CiliumPanel';
import FlinkPanel from '@/components/FlinkPanel';
import DebeziumPanel from '@/components/DebeziumPanel';
import BenthosPanel from '@/components/BenthosPanel';
import CassandraPanel from '@/components/CassandraPanel';
import CockroachDbPanel from '@/components/CockroachDbPanel';
import ConsulPanel from '@/components/ConsulPanel';
import ClickhouseMigrationPanel from '@/components/ClickhouseMigrationPanel';
import DbtPanel from '@/components/DbtPanel';
import DockerBuildPanel from '@/components/DockerBuildPanel';
import DragonflyPanel from '@/components/DragonflyPanel';
import FlamegraphPanel from '@/components/FlamegraphPanel';
import GitSignPanel from '@/components/GitSignPanel';
import HtopPanel from '@/components/HtopPanel';
import InfluxDbPanel from '@/components/InfluxDbPanel';
import DronePanel from '@/components/DronePanel';
import CgroupsPanel from '@/components/CgroupsPanel';
import CurlHeadersPanel from '@/components/CurlHeadersPanel';
import DragonFlyDnsPanel from '@/components/DragonFlyDnsPanel';
import IpLinkPanel from '@/components/IpLinkPanel';
import K6SummaryPanel from '@/components/K6SummaryPanel';
import KubePrometheusPanel from '@/components/KubePrometheusPanel';
import LatencyMapPanel from '@/components/LatencyMapPanel';
import MimirPanel from '@/components/MimirPanel';
import NetstatPanel from '@/components/NetstatPanel';
import OpenCostPanel from '@/components/OpenCostPanel';
import ParcaPanel from '@/components/ParcaPanel';
import PnpmWorkspacePanel from '@/components/PnpmWorkspacePanel';
import PrometheusPanel from '@/components/PrometheusPanel';
import ProwPanel from '@/components/ProwPanel';
import RedisCLIPanel from '@/components/RedisCLIPanel';
import RoutingTablePanel from '@/components/RoutingTablePanel';
import TrivyPanel from '@/components/TrivyPanel';
import TailscalePanel from '@/components/TailscalePanel';
import UlimitPanel from '@/components/UlimitPanel';
import VaultPanel from '@/components/VaultPanel';
import VaultPkiPanel from '@/components/VaultPkiPanel';
import VegetaPanel from '@/components/VegetaPanel';
import AnsiblePlaybookPanel from '@/components/AnsiblePlaybookPanel';
import AlertManagerPanel from '@/components/AlertManagerPanel';
import ArgoCDPanel from '@/components/ArgoCDPanel';
import ArgoEventsPanel from '@/components/ArgoEventsPanel';
import ArgoRolloutPanel from '@/components/ArgoRolloutPanel';
import ArgoWorkflowsPanel from '@/components/ArgoWorkflowsPanel';
import AtlasPanel from '@/components/AtlasPanel';
import AuditdPanel from '@/components/AuditdPanel';
import AuthentikPanel from '@/components/AuthentikPanel';
import AwsBedrockPanel from '@/components/AwsBedrockPanel';
import AwsCliPanel from '@/components/AwsCliPanel';
import BackstagePanel from '@/components/BackstagePanel';
import BazelPanel from '@/components/BazelPanel';
import BeylaPanel from '@/components/BeylaPanel';
import BgpLookupPanel from '@/components/BgpLookupPanel';
import BoundaryPanel from '@/components/BoundaryPanel';
import BpftracePanel from '@/components/BpftracePanel';
import BufPanel from '@/components/BufPanel';
import BuildOutputPanel from '@/components/BuildOutputPanel';
import BunBuildPanel from '@/components/BunBuildPanel';
import BundleAnalysisPanel from '@/components/BundleAnalysisPanel';
import CaddyAccessPanel from '@/components/CaddyAccessPanel';
import CaddyPanel from '@/components/CaddyPanel';
import CargoPanel from '@/components/CargoPanel';
import CephPanel from '@/components/CephPanel';
import CertInfoPanel from '@/components/CertInfoPanel';
import CertManagerPanel from '@/components/CertManagerPanel';
import ChaosMeshPanel from '@/components/ChaosMeshPanel';
import CIPipelinePanel from '@/components/CIPipelinePanel';
import CitusPanel from '@/components/CitusPanel';
import ClickHouseKeeperPanel from '@/components/ClickHouseKeeperPanel';
import ClickhouseMvPanel from '@/components/ClickhouseMvPanel';
import ClickhouseQueryPanel from '@/components/ClickhouseQueryPanel';
import CloudflareWorkersPanel from '@/components/CloudflareWorkersPanel';
import CloudNativePGPanel from '@/components/CloudNativePGPanel';
import ClusterApiPanel from '@/components/ClusterApiPanel';
import CniPanel from '@/components/CniPanel';
import ContainerdPanel from '@/components/ContainerdPanel';
import CortexPanel from '@/components/CortexPanel';
import CosignPanel from '@/components/CosignPanel';
import CoverageReportPanel from '@/components/CoverageReportPanel';
import CpuStatsPanel from '@/components/CpuStatsPanel';
import CrontabPanel from '@/components/CrontabPanel';
import CrossplanePanel from '@/components/CrossplanePanel';
import CrunchyPostgresPanel from '@/components/CrunchyPostgresPanel';
import CuePanel from '@/components/CuePanel';
import CurlJwtPanel from '@/components/CurlJwtPanel';
import CurlVerbosePanel from '@/components/CurlVerbosePanel';
import CycloneDxPanel from '@/components/CycloneDxPanel';
import DaggerPanel from '@/components/DaggerPanel';
import DbMigrationPanel from '@/components/DbMigrationPanel';
import DeltaLakePanel from '@/components/DeltaLakePanel';
import DigPanel from '@/components/DigPanel';
import DiskUsagePanel from '@/components/DiskUsagePanel';
import DnsLookupPanel from '@/components/DnsLookupPanel';
import DockerComposePanel from '@/components/DockerComposePanel';
import DockerStatsPanel from '@/components/DockerStatsPanel';
import DruidPanel from '@/components/DruidPanel';
import EarthlyPanel from '@/components/EarthlyPanel';
import EbpfTracePanel from '@/components/EbpfTracePanel';
import EnvoyStatsPanel from '@/components/EnvoyStatsPanel';
import EslintOutputPanel from '@/components/EslintOutputPanel';
import ExternalDnsPanel from '@/components/ExternalDnsPanel';
import FalcoPanel from '@/components/FalcoPanel';
import FioPanel from '@/components/FioPanel';
import FlaggerPanel from '@/components/FlaggerPanel';
import FluentBitPanel from '@/components/FluentBitPanel';
import FluxCDPanel from '@/components/FluxCDPanel';
import FreeMemPanel from '@/components/FreeMemPanel';
import GatlingPanel from '@/components/GatlingPanel';
import GhActionsRunPanel from '@/components/GhActionsRunPanel';
import GhCliPanel from '@/components/GhCliPanel';
import GitBisectPanel from '@/components/GitBisectPanel';
import GitBlamePanel from '@/components/GitBlamePanel';
import GiteaPanel from '@/components/GiteaPanel';

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
        <div className="mt-6 pb-6">
          <HubblePanel />
        </div>

        {/* gvisor sandboxed runtime — runsc, kvm/ptrace, sentry, syscall interception */}
        <div className="mt-6 pb-10">
          <GVisorPanel />
        </div>

        {/* nomad workload orchestrator — jobs, allocs, datacenters, task drivers */}
        <div className="mt-6 pb-6">
          <NomadPanel />
        </div>

        {/* kube-proxy service routing — iptables nat rules, cluster IP, endpoints */}
        <div className="mt-6 pb-6">
          <KubeProxyPanel />
        </div>

        {/* sonarqube code quality — coverage, security gates, open issues */}
        <div className="mt-6 pb-10">
          <SonarQubePanel />
        </div>

        {/* keda kubernetes event-driven autoscaler — scaled objects, triggers, scale events */}
        <div className="mt-6 pb-6">
          <KedaPanel />
        </div>

        {/* zarf air-gap k8s packaging — packages, components, internal registry */}
        <div className="mt-6 pb-10">
          <ZarfPanel />
        </div>

        {/* biome rust linter + formatter — files, diagnostics, lint rules */}
        <div className="mt-6 pb-6">
          <BiomePanel />
        </div>

        {/* rabbitmq amqp broker — queues, exchanges, publish/deliver rates */}
        <div className="mt-6 pb-6">
          <RabbitMQPanel />
        </div>

        {/* socket.dev supply chain security — packages, alerts, cves */}
        <div className="mt-6 pb-6">
          <SocketPanel />
        </div>

        {/* pixie ebpf observability — no-instrumentation, pxl scripts, live */}
        <div className="mt-6 pb-6">
          <PixiePanel />
        </div>

        {/* nats jetstream messaging — subjects, consumers, streams */}
        <div className="mt-6 pb-6">
          <NatsPanel />
        </div>

        {/* envoy service proxy — clusters, listeners, admin api */}
        <div className="mt-6 pb-6">
          <EnvoyPanel />
        </div>

        {/* linkerd service mesh — mtls, golden signals, routes */}
        <div className="mt-6 pb-6">
          <LinkerdPanel />
        </div>

        {/* clickhouse columnar olap — tables, queries, mergetree */}
        <div className="mt-6 pb-6">
          <ClickHousePanel />
        </div>

        {/* etcd distributed kv — members, raft, operations */}
        <div className="mt-6 pb-6">
          <EtcdPanel />
        </div>

        {/* kind k8s in docker — clusters, nodes, e2e testing */}
        <div className="mt-6 pb-6">
          <KindPanel />
        </div>

        {/* kube-state-metrics k8s object metrics — resources, labels, conditions */}
        <div className="mt-6 pb-6">
          <KubeStateMetricsPanel />
        </div>

        {/* openfga fine-grained authorization — stores, tuples, checks */}
        <div className="mt-6 pb-6">
          <OpenFGAPanel />
        </div>

        {/* kafka connect data integration — connectors, cdc, sinks */}
        <div className="mt-6 pb-6">
          <KafkaConnectPanel />
        </div>

        {/* spicedb zanzibar authorization — schema, relationships, checks */}
        <div className="mt-6 pb-6">
          <SpiceDBPanel />
        </div>

        {/* strimzi kafka on kubernetes — topics, consumers, brokers */}
        <div className="mt-6 pb-6">
          <StrimziPanel />
        </div>

        {/* typesense search engine — collections, documents, queries */}
        <div className="mt-6 pb-6">
          <TypesensePanel />
        </div>

        {/* duckdb analytics — queries, schemas, performance */}
        <div className="mt-6 pb-6">
          <DuckdbPanel />
        </div>

        {/* rekor artifact transparency log — entries, signatures, attestations */}
        <div className="mt-6 pb-6">
          <RekorPanel />
        </div>

        {/* sigstore supply chain security — signing, verification, policy */}
        <div className="mt-6 pb-6">
          <SigstorePanel />
        </div>

        {/* web vitals core metrics — lcp, cls, inp, fid */}
        <div className="mt-6 pb-6">
          <WebVitalsPanel />
        </div>

        {/* dmesg kernel ring buffer — messages, drivers, boot */}
        <div className="mt-6 pb-6">
          <DmesgPanel />
        </div>

        {/* airbyte open-source elt — connectors, syncs, data movement */}
        <div className="mt-6 pb-6">
          <AirbytePanel />
        </div>

        {/* nats jetstream — streams, consumers, messages, acks */}
        <div className="mt-6 pb-6">
          <NATSJetStreamPanel />
        </div>

        {/* dapr distributed application runtime — actors, pub/sub, state */}
        <div className="mt-6 pb-6">
          <DaprPanel />
        </div>

        {/* airflow dag orchestration — celery, sensors, xcom, dynamic tasks */}
        <div className="mt-6 pb-6">
          <AirflowPanel />
        </div>

        {/* cilium ebpf networking — endpoints, policy, hubble flows */}
        <div className="mt-6 pb-6">
          <CiliumPanel />
        </div>

        {/* flink stateful stream processing — exactly-once, windows, checkpoints */}
        <div className="mt-6 pb-6">
          <FlinkPanel />
        </div>

        {/* debezium change data capture — connectors, events, offsets */}
        <div className="mt-6 pb-6">
          <DebeziumPanel />
        </div>

        {/* benthos — stream processor, pipelines, transforms */}
        <div className="mt-6 pb-6">
          <BenthosPanel />
        </div>

        {/* cassandra — distributed wide-column store, keyspaces, cql */}
        <div className="mt-6 pb-6">
          <CassandraPanel />
        </div>

        {/* cockroachdb — distributed sql, ranges, leases, replication */}
        <div className="mt-6 pb-6">
          <CockroachDbPanel />
        </div>

        {/* consul — service mesh, kv, health checks, intentions */}
        <div className="mt-6 pb-6">
          <ConsulPanel />
        </div>

        {/* clickhouse migration — schema versions, runs, checksums */}
        <div className="mt-6 pb-6">
          <ClickhouseMigrationPanel />
        </div>

        {/* dbt — transforms, models, tests, lineage */}
        <div className="mt-6 pb-6">
          <DbtPanel />
        </div>

        {/* docker build — layers, cache, stages, push */}
        <div className="mt-6 pb-6">
          <DockerBuildPanel />
        </div>

        {/* dragonfly — redis-compatible, throughput, latency, memory */}
        <div className="mt-6 pb-6">
          <DragonflyPanel />
        </div>

        {/* flamegraph — cpu profiling, call stacks, hotspots */}
        <div className="mt-6 pb-6">
          <FlamegraphPanel />
        </div>

        {/* git sign — gpg commit signing, key ids, verification */}
        <div className="mt-6 pb-6">
          <GitSignPanel />
        </div>

        {/* htop — process monitor, cpu bars, mem, sort, filter */}
        <div className="mt-6 pb-6">
          <HtopPanel />
        </div>

        {/* influxdb — time series, measurements, tags, retention */}
        <div className="mt-6 pb-6">
          <InfluxDbPanel />
        </div>

        {/* drone — ci pipelines, steps, runners, secrets */}
        <div className="mt-6 pb-6">
          <DronePanel />
        </div>

        {/* cgroups — cpu, memory, io, pids quotas */}
        <div className="mt-6 pb-6">
          <CgroupsPanel />
        </div>

        {/* curl headers — request, response, tls, timing */}
        <div className="mt-6 pb-6">
          <CurlHeadersPanel />
        </div>

        {/* dragonfly dns — cache, hits, misses, latency, zones */}
        <div className="mt-6 pb-6">
          <DragonFlyDnsPanel />
        </div>

        {/* ip link — interfaces, mtu, state, mac, flags */}
        <div className="mt-6 pb-6">
          <IpLinkPanel />
        </div>

        {/* k6 summary — scenarios, thresholds, checks, http */}
        <div className="mt-6 pb-6">
          <K6SummaryPanel />
        </div>

        {/* kube prometheus — rules, alerts, scrapes, metrics */}
        <div className="mt-6 pb-6">
          <KubePrometheusPanel />
        </div>

        {/* latency map — p50, p95, p99, regions, heatmap */}
        <div className="mt-6 pb-6">
          <LatencyMapPanel />
        </div>

        {/* mimir — ruler, compactor, distributor, ingester */}
        <div className="mt-6 pb-6">
          <MimirPanel />
        </div>

        {/* netstat — connections, states, ports, protocols */}
        <div className="mt-6 pb-6">
          <NetstatPanel />
        </div>

        {/* opencost — workloads, namespaces, cost, efficiency */}
        <div className="mt-6 pb-6">
          <OpenCostPanel />
        </div>

        {/* parca — profiles, flamegraph, cpu, heap, goroutines */}
        <div className="mt-6 pb-6">
          <ParcaPanel />
        </div>

        {/* pnpm workspace — packages, deps, scripts, filters */}
        <div className="mt-6 pb-6">
          <PnpmWorkspacePanel />
        </div>

        {/* prometheus — targets, rules, alerts, tsdb */}
        <div className="mt-6 pb-6">
          <PrometheusPanel />
        </div>

        {/* prow — kubernetes ci, jobs, tide, pass rates */}
        <div className="mt-6 pb-6">
          <ProwPanel />
        </div>

        {/* redis cli — commands, keys, ttl, memory, cluster */}
        <div className="mt-6 pb-6">
          <RedisCLIPanel />
        </div>

        {/* routing table — destinations, gateways, metrics, flags */}
        <div className="mt-6 pb-6">
          <RoutingTablePanel />
        </div>

        {/* trivy — container scan, cves, sbom, misconfigs */}
        <div className="mt-6 pb-6">
          <TrivyPanel />
        </div>

        {/* tailscale — zero-config vpn, wireguard mesh, devices, acl */}
        <div className="mt-6 pb-6">
          <TailscalePanel />
        </div>

        {/* ulimit — resource limits, nofile, nproc, stack, memlock */}
        <div className="mt-6 pb-6">
          <UlimitPanel />
        </div>

        {/* vault — secrets engine, kv, pki, aws, policies */}
        <div className="mt-6 pb-6">
          <VaultPanel />
        </div>

        {/* vault pki — internal ca, intermediate, issue, rotate, k8s-auth */}
        <div className="mt-6 pb-6">
          <VaultPkiPanel />
        </div>

        {/* vegeta — http load testing, constant rate, latency histograms */}
        <div className="mt-6 pb-6">
          <VegetaPanel />
        </div>

        {/* ansible playbook — tasks, hosts, roles, handlers, inventory */}
        <div className="mt-6 pb-6">
          <AnsiblePlaybookPanel />
        </div>

        {/* alertmanager — prometheus alerts, groups, silences, receivers */}
        <div className="mt-6 pb-6">
          <AlertManagerPanel />
        </div>

        {/* argo cd — gitops, sync, apps, rollbacks */}
        <div className="mt-6 pb-6">
          <ArgoCDPanel />
        </div>

        {/* argo events — event-driven workflows, event sources, sensors, triggers */}
        <div className="mt-6 pb-6">
          <ArgoEventsPanel />
        </div>

        {/* argo rollout — progressive delivery, canary, bluegreen, analysis */}
        <div className="mt-6 pb-6">
          <ArgoRolloutPanel />
        </div>

        {/* argo workflows — dag pipelines, ml training, artifacts, parallel steps */}
        <div className="mt-6 pb-6">
          <ArgoWorkflowsPanel />
        </div>

        {/* atlas database schema management — migrations, drift, ci */}
        <div className="mt-6 pb-6">
          <AtlasPanel />
        </div>

        {/* auditd linux audit framework — syscalls, events, rules, trails */}
        <div className="mt-6 pb-6">
          <AuditdPanel />
        </div>

        {/* authentik identity provider — sso, oauth2, saml, audit */}
        <div className="mt-6 pb-6">
          <AuthentikPanel />
        </div>

        {/* aws bedrock — foundation models, inference, agents */}
        <div className="mt-6 pb-6">
          <AwsBedrockPanel />
        </div>

        {/* aws cli — s3, ec2, iam, lambda commands */}
        <div className="mt-6 pb-6">
          <AwsCliPanel />
        </div>

        {/* backstage developer portal — catalog, tech radar, plugins */}
        <div className="mt-6 pb-6">
          <BackstagePanel />
        </div>

        {/* bazel hermetic build — remote cache, targets, action cache stats */}
        <div className="mt-6 pb-6">
          <BazelPanel />
        </div>

        {/* beyla ebpf auto-instrumentation — spans, latency, red metrics */}
        <div className="mt-6 pb-6">
          <BeylaPanel />
        </div>

        {/* bgp routing table lookup — asn, prefixes, peers, path */}
        <div className="mt-6 pb-6">
          <BgpLookupPanel />
        </div>

        {/* boundary zero-trust infrastructure access — targets, sessions, policies */}
        <div className="mt-6 pb-6">
          <BoundaryPanel />
        </div>

        {/* bpftrace kernel tracing — probes, maps, scripts, hist */}
        <div className="mt-6 pb-6">
          <BpftracePanel />
        </div>

        {/* buf protobuf lint, breaking, generate, push */}
        <div className="mt-6 pb-6">
          <BufPanel />
        </div>

        {/* build output — compile steps, warnings, errors, timing */}
        <div className="mt-6 pb-6">
          <BuildOutputPanel />
        </div>

        {/* bun build — bundler, transpile, minify, treeshake */}
        <div className="mt-6 pb-6">
          <BunBuildPanel />
        </div>

        {/* bundle analysis — size, chunks, treeshake, deps */}
        <div className="mt-6 pb-6">
          <BundleAnalysisPanel />
        </div>

        {/* caddy access log — requests, status, latency, bytes */}
        <div className="mt-6 pb-6">
          <CaddyAccessPanel />
        </div>

        {/* caddy reverse proxy — routes, tls, upstreams, logs */}
        <div className="mt-6 pb-6">
          <CaddyPanel />
        </div>

        {/* cargo release build — compile, link, test, artifact */}
        <div className="mt-6 pb-6">
          <CargoPanel />
        </div>

        {/* ceph cluster — osds, pools, pg, replication */}
        <div className="mt-6 pb-6">
          <CephPanel />
        </div>

        {/* tls certificate info — san, validity, issuer, chain */}
        <div className="mt-6 pb-6">
          <CertInfoPanel />
        </div>

        {/* cert manager — issuers, certificates, renewals, status */}
        <div className="mt-6 pb-6">
          <CertManagerPanel />
        </div>

        {/* chaos mesh — faults, experiments, schedules, pods */}
        <div className="mt-6 pb-6">
          <ChaosMeshPanel />
        </div>

        {/* ci pipeline — stages, jobs, artifacts, runners */}
        <div className="mt-6 pb-6">
          <CIPipelinePanel />
        </div>

        {/* citus distributed postgres — shards, workers, routing */}
        <div className="mt-6 pb-6">
          <CitusPanel />
        </div>

        {/* clickhouse keeper — raft, snapshots, quorum, znodes */}
        <div className="mt-6 pb-6">
          <ClickHouseKeeperPanel />
        </div>

        {/* clickhouse mv — materialized views, triggers, refresh */}
        <div className="mt-6 pb-6">
          <ClickhouseMvPanel />
        </div>

        {/* clickhouse query — explain, profiling, system tables */}
        <div className="mt-6 pb-6">
          <ClickhouseQueryPanel />
        </div>

        {/* cloudflare workers — kv, durable objects, queues, r2 */}
        <div className="mt-6 pb-6">
          <CloudflareWorkersPanel />
        </div>

        {/* cloudnative pg — clusters, backups, replication, switchover */}
        <div className="mt-6 pb-6">
          <CloudNativePGPanel />
        </div>

        {/* cluster api — providers, machinedeployments, kubeadm, lifecycle */}
        <div className="mt-6 pb-6">
          <ClusterApiPanel />
        </div>

        {/* cni — plugins, ipam, overlay, policy */}
        <div className="mt-6 pb-6">
          <CniPanel />
        </div>

        {/* containerd — images, containers, namespaces, snapshots */}
        <div className="mt-6 pb-6">
          <ContainerdPanel />
        </div>

        {/* cortex — query engine, ruler, compactor, store-gateway */}
        <div className="mt-6 pb-6">
          <CortexPanel />
        </div>

        {/* cosign — keyless signing, sbom, attestation, policy */}
        <div className="mt-6 pb-6">
          <CosignPanel />
        </div>

        {/* coverage report — lcov, html, badge, threshold */}
        <div className="mt-6 pb-6">
          <CoverageReportPanel />
        </div>

        {/* cpu stats — load, cores, frequency, temperature */}
        <div className="mt-6 pb-6">
          <CpuStatsPanel />
        </div>

        {/* crontab — schedule, jobs, logs, next-run */}
        <div className="mt-6 pb-6">
          <CrontabPanel />
        </div>

        {/* crossplane — providers, compositions, claims, xrds */}
        <div className="mt-6 pb-6">
          <CrossplanePanel />
        </div>

        {/* crunchy postgres — operator, clusters, pgbackrest, monitoring */}
        <div className="mt-6 pb-6">
          <CrunchyPostgresPanel />
        </div>

        {/* cue — schema, validation, export, evaluate */}
        <div className="mt-6 pb-6">
          <CuePanel />
        </div>

        {/* curl jwt — bearer, decode, expiry, claims */}
        <div className="mt-6 pb-6">
          <CurlJwtPanel />
        </div>

        {/* curl verbose — headers, timings, tls, redirect */}
        <div className="mt-6 pb-6">
          <CurlVerbosePanel />
        </div>

        {/* cyclonedx — sbom, components, licenses, vulnerabilities */}
        <div className="mt-6 pb-6">
          <CycloneDxPanel />
        </div>

        {/* dagger — pipelines, containers, cache, secrets */}
        <div className="mt-6 pb-6">
          <DaggerPanel />
        </div>

        {/* db migration — schema, up, down, status */}
        <div className="mt-6 pb-6">
          <DbMigrationPanel />
        </div>

        {/* delta lake — tables, vacuum, history, merge */}
        <div className="mt-6 pb-6">
          <DeltaLakePanel />
        </div>

        {/* dig — dns, records, ttl, nameserver */}
        <div className="mt-6 pb-6">
          <DigPanel />
        </div>

        {/* disk usage — df, partitions, inodes, mounts */}
        <div className="mt-6 pb-6">
          <DiskUsagePanel />
        </div>

        {/* dns lookup — query, records, ttl, resolver */}
        <div className="mt-6 pb-6">
          <DnsLookupPanel />
        </div>

        {/* docker compose — services, networks, volumes, health */}
        <div className="mt-6 pb-6">
          <DockerComposePanel />
        </div>

        {/* docker stats — containers, cpu, mem, net */}
        <div className="mt-6 pb-6">
          <DockerStatsPanel />
        </div>

        {/* druid — datasources, tasks, segments, compaction */}
        <div className="mt-6 pb-6">
          <DruidPanel />
        </div>

        {/* earthly — targets, artifacts, cache, secrets */}
        <div className="mt-6 pb-6">
          <EarthlyPanel />
        </div>

        {/* ebpf trace — probes, maps, events, syscalls */}
        <div className="mt-6 pb-6">
          <EbpfTracePanel />
        </div>

        {/* envoy stats — rq, cx, health, rq_retry */}
        <div className="mt-6 pb-6">
          <EnvoyStatsPanel />
        </div>

        {/* eslint output — rules, warnings, errors, fixable */}
        <div className="mt-6 pb-6">
          <EslintOutputPanel />
        </div>

        {/* external dns — records, providers, sources, sync */}
        <div className="mt-6 pb-6">
          <ExternalDnsPanel />
        </div>

        {/* falco — syscalls, rules, alerts, k8s */}
        <div className="mt-6 pb-6">
          <FalcoPanel />
        </div>

        {/* fio — iops, bw, latency, jobs */}
        <div className="mt-6 pb-6">
          <FioPanel />
        </div>

        {/* flagger — canaries, rollouts, analysis, webhooks */}
        <div className="mt-6 pb-6">
          <FlaggerPanel />
        </div>

        {/* fluentbit — pipelines, inputs, outputs, filters */}
        <div className="mt-6 pb-6">
          <FluentBitPanel />
        </div>

        {/* fluxcd — sources, kustomizations, helmreleases, alerts */}
        <div className="mt-6 pb-6">
          <FluxCDPanel />
        </div>

        {/* freemem — rss, heap, external, arraybuffers */}
        <div className="mt-6 pb-6">
          <FreeMemPanel />
        </div>

        {/* gatling — scenarios, users, rps, latency */}
        <div className="mt-6 pb-6">
          <GatlingPanel />
        </div>

        {/* gh actions run — jobs, steps, status, duration */}
        <div className="mt-6 pb-6">
          <GhActionsRunPanel />
        </div>

        {/* gh cli — repos, prs, issues, releases */}
        <div className="mt-6 pb-6">
          <GhCliPanel />
        </div>

        {/* git bisect — good, bad, skip, reset */}
        <div className="mt-6 pb-6">
          <GitBisectPanel />
        </div>

        {/* git blame — authors, commits, lines, dates */}
        <div className="mt-6 pb-6">
          <GitBlamePanel />
        </div>

        {/* gitea — repos, issues, prs, org */}
        <div className="mt-6 pb-10">
          <GiteaPanel />
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
