import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RecentCommitsPanel from '@/components/RecentCommitsPanel';
import TerminalCalPanel from '@/components/TerminalCalPanel';
import CrontabPanel from '@/components/CrontabPanel';
import DiskUsagePanel from '@/components/DiskUsagePanel';
import IostatPanel from '@/components/IostatPanel';
import JournalctlPanel from '@/components/JournalctlPanel';
import WhoPanel from '@/components/WhoPanel';
import TimezoneClockPanel from '@/components/TimezoneClockPanel';
import PsAuxPanel from '@/components/PsAuxPanel';
import UfwStatusPanel from '@/components/UfwStatusPanel';
import SystemdTimersPanel from '@/components/SystemdTimersPanel';
import BpftracePanel from '@/components/BpftracePanel';
import OtelTracesPanel from '@/components/OtelTracesPanel';
import WireGuardPanel from '@/components/WireGuardPanel';
import SystemdStatusPanel from '@/components/SystemdStatusPanel';
import FioPanel from '@/components/FioPanel';
import TokioRuntimePanel from '@/components/TokioRuntimePanel';
import VectorPipelinePanel from '@/components/VectorPipelinePanel';
import CiliumPanel from '@/components/CiliumPanel';
import SysdigPanel from '@/components/SysdigPanel';
import VegetaPanel from '@/components/VegetaPanel';
import DaggerPanel from '@/components/DaggerPanel';
import ConsulPanel from '@/components/ConsulPanel';
import KedaPanel from '@/components/KedaPanel';
import SpiffePanel from '@/components/SpiffePanel';
import TrinoPanel from '@/components/TrinoPanel';
import PulsarPanel from '@/components/PulsarPanel';
import VaultPkiPanel from '@/components/VaultPkiPanel';
import AirflowPanel from '@/components/AirflowPanel';
import CloudflareWorkersPanel from '@/components/CloudflareWorkersPanel';
import DeltaLakePanel from '@/components/DeltaLakePanel';
import KubeStateMetricsPanel from '@/components/KubeStateMetricsPanel';
import ProwPanel from '@/components/ProwPanel';
import DragonFlyDnsPanel from '@/components/DragonFlyDnsPanel';
import PyroscopePanel from '@/components/PyroscopePanel';
import KubeflowPanel from '@/components/KubeflowPanel';
import KeycloakPanel from '@/components/KeycloakPanel';
import MLflowPanel from '@/components/MLflowPanel';
import PromtailPanel from '@/components/PromtailPanel';
import FalcoPanel from '@/components/FalcoPanel';
import TailscalePanel from '@/components/TailscalePanel';
import OtelCollectorPanel from '@/components/OtelCollectorPanel';
import TeleportPanel from '@/components/TeleportPanel';
import CertManagerPanel from '@/components/CertManagerPanel';
import TektonPanel from '@/components/TektonPanel';
import KubeVirtPanel from '@/components/KubeVirtPanel';
import KubePrometheusPanel from '@/components/KubePrometheusPanel';
import KubeAuditPanel from '@/components/KubeAuditPanel';
import GrypePanel from '@/components/GrypePanel';
import ThanosPanel from '@/components/ThanosPanel';
import TetragonPanel from '@/components/TetragonPanel';
import GrafanaTempoPanel from '@/components/GrafanaTempoPanel';
import GrafanaOnCallPanel from '@/components/GrafanaOnCallPanel';
import SkaffoldPanel from '@/components/SkaffoldPanel';
import MisePanel from '@/components/MisePanel';
import GitWorktreePanel from '@/components/GitWorktreePanel';
import GitBlamePanel from '@/components/GitBlamePanel';
import NATSJetStreamPanel from '@/components/NATSJetStreamPanel';
import AirbytePanel from '@/components/AirbytePanel';
import FlinkPanel from '@/components/FlinkPanel';
import GoReleaserPanel from '@/components/GoReleaserPanel';
import DaprPanel from '@/components/DaprPanel';
import AtlasPanel from '@/components/AtlasPanel';
import DebeziumPanel from '@/components/DebeziumPanel';
import QdrantPanel from '@/components/QdrantPanel';
import BeylaPanel from '@/components/BeylaPanel';
import ContainerdPanel from '@/components/ContainerdPanel';
import DockerStatsPanel from '@/components/DockerStatsPanel';
import FreeMemPanel from '@/components/FreeMemPanel';
import GhCliPanel from '@/components/GhCliPanel';
import HelmChartPanel from '@/components/HelmChartPanel';
import JournalWcPanel from '@/components/JournalWcPanel';
import K9sPanel from '@/components/K9sPanel';
import KubebenchPanel from '@/components/KubebenchPanel';
import KubeProxyPanel from '@/components/KubeProxyPanel';
import LokiQueryPanel from '@/components/LokiQueryPanel';
import MemInfoPanel from '@/components/MemInfoPanel';
import BundleAnalysisPanel from '@/components/BundleAnalysisPanel';
import CoverageReportPanel from '@/components/CoverageReportPanel';
import EnvPanel from '@/components/EnvPanel';
import NatsPubSubPanel from '@/components/NatsPubSubPanel';
import NftablesPanel from '@/components/NftablesPanel';
import NpmOutdatedPanel from '@/components/NpmOutdatedPanel';
import OpenSearchPanel from '@/components/OpenSearchPanel';
import PgExplainPanel from '@/components/PgExplainPanel';
import PrometheusAlertPanel from '@/components/PrometheusAlertPanel';
import RekorPanel from '@/components/RekorPanel';
import RssFeedPanel from '@/components/RssFeedPanel';
import ScyllaPanel from '@/components/ScyllaPanel';
import SentryIssuesPanel from '@/components/SentryIssuesPanel';
import SonarQubePanel from '@/components/SonarQubePanel';
import StraceSummaryPanel from '@/components/StraceSummaryPanel';
import TailnetStatusPanel from '@/components/TailnetStatusPanel';
import VmstatPanel from '@/components/VmstatPanel';
import WebVitalsPanel from '@/components/WebVitalsPanel';
import WeaviatePanel from '@/components/WeaviatePanel';
import VscodeExtensionsPanel from '@/components/VscodeExtensionsPanel';
import ZitadelPanel from '@/components/ZitadelPanel';
import AlertManagerPanel from '@/components/AlertManagerPanel';
import AnsiblePlaybookPanel from '@/components/AnsiblePlaybookPanel';
import ActPanel from '@/components/ActPanel';
import ArgoCDPanel from '@/components/ArgoCDPanel';
import ArgoEventsPanel from '@/components/ArgoEventsPanel';
import ArgoRolloutPanel from '@/components/ArgoRolloutPanel';
import ArgoWorkflowsPanel from '@/components/ArgoWorkflowsPanel';
import AuditdPanel from '@/components/AuditdPanel';
import AuthentikPanel from '@/components/AuthentikPanel';
import AwsBedrockPanel from '@/components/AwsBedrockPanel';
import AwsCliPanel from '@/components/AwsCliPanel';

export const metadata: Metadata = {
  title: 'Now',
  description: 'What Construx Group is working on right now.',
  alternates: { canonical: 'https://construxgroup.io/now' },
};

const LAST_UPDATED = 'May 2027';
const BUILD_STAMP = '2027-05-12T09:00:00Z';

const nowItems = [
  {
    category: 'PRODUCTS',
    items: [
      {
        title: 'Scoutr: professional user optimisation',
        body: 'Iterating on the batch output view based on usage from professional arbitrage traders. Working on better sorting controls and a faster scan mechanism for multi-page retailers.',
        status: 'IN_PROGRESS',
      },
      {
        title: 'The Marqet: taxonomy refinement',
        body: 'Reviewing the four-category browse structure against real usage data. Some professional roles are underrepresented; expanding those verticals.',
        status: 'IN_PROGRESS',
      },
      {
        title: 'The Hyve: AI context improvements',
        body: 'Improving the context pipeline for the AI agent — better retrieval of relevant past decisions, smarter truncation for long channel histories.',
        status: 'IN_PROGRESS',
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
        title: '300 dispatches and continuing',
        body: 'Writing consistently about what we build and why — build logs, methodology posts, product thinking, and strategy. Dispatch 300 shipped in May 2027 — a milestone post on what compounding looks like across 300 technical entries. Recent entries cover TypeScript strict mode, Stripe billing patterns, presigned URL uploads, Next.js middleware, pgvector semantic search, and structured outputs from Claude. The journal compounds.',
        status: 'ONGOING',
      },
    ],
  },
  {
    category: 'EXPLORING',
    items: [
      {
        title: 'The Lattice: AI practitioner network',
        body: "Running a 60-day demand test: a landing page for a professional network for AI practitioners. Targeting 500 email signups before committing to the build. At day 30 we have 284 — referral rate 18.2%, email return rate 31.4%. Both quality signals above threshold. Quantity slightly behind linear pace.",
        status: 'RESEARCH',
      },
    ],
  },
];

const STATUS_META: Record<string, { color: string; bg: string; indicator: string }> = {
  'IN_PROGRESS': { color: '#F97316', bg: 'rgba(249,115,22,0.08)', indicator: '▶' },
  'PENDING':     { color: 'rgba(234,179,8,0.85)',   bg: 'rgba(234,179,8,0.07)',   indicator: '◌' },
  'ONGOING':     { color: 'rgba(74,222,128,0.85)',  bg: 'rgba(74,222,128,0.07)',  indicator: '●' },
  'RESEARCH':    { color: 'rgba(168,85,247,0.85)',  bg: 'rgba(168,85,247,0.07)',  indicator: '◈' },
};

const CATEGORY_ACCENT: Record<string, string> = {
  PRODUCTS:       '#F97316',
  INFRASTRUCTURE: '#67e8f9',
  JOURNAL:        '#a78bfa',
  EXPLORING:      '#4ade80',
};

function StatusChip({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { color: 'rgba(240,239,255,0.45)', bg: 'rgba(255,255,255,0.04)', indicator: '○' };
  return (
    <span
      className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 flex-shrink-0 flex items-center gap-1.5"
      style={{ background: meta.bg, color: meta.color, borderRadius: '2px' }}
    >
      <span>{meta.indicator}</span>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function NowPage() {
  const totalItems = nowItems.reduce((s, c) => s + c.items.length, 0);
  const inProgress = nowItems.flatMap((c) => c.items).filter((i) => i.status === 'IN_PROGRESS').length;
  const pending    = nowItems.flatMap((c) => c.items).filter((i) => i.status === 'PENDING').length;

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

          {/* Inline meta strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5">
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              Updated: <span className="text-text-muted">{LAST_UPDATED}</span>
            </span>
            <span className="w-px h-3 bg-border flex-shrink-0" />
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              Items: <span className="text-construx">{String(totalItems).padStart(2, '0')}</span>
            </span>
            <span className="w-px h-3 bg-border flex-shrink-0" />
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              Active: <span style={{ color: '#F97316' }}>{inProgress}</span>
            </span>
            <span className="w-px h-3 bg-border flex-shrink-0" />
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">
              Pending: <span style={{ color: 'rgba(234,179,8,0.8)' }}>{pending}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Terminal window */}
      <div className="px-5 py-12 mx-auto max-w-3xl">
        <div
          style={{
            background: 'rgba(1,1,10,0.97)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '6px',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)',
            overflow: 'hidden',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.4)' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.35)' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.35)' }} />
            </div>
            <span className="font-mono text-[9px] text-text-dim tracking-wide flex-1 text-center">
              construx@sys — construx-now — bash
            </span>
            <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.12)' }}>80×35</span>
          </div>

          {/* Terminal body */}
          <div
            className="font-mono overflow-x-auto"
            style={{ padding: '20px 24px 24px', fontSize: '12px', lineHeight: '1.75', color: 'rgba(240,239,255,0.65)' }}
          >
            {/* Shell prompt */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@sys</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>:~$ </span>
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>cat /var/construx/now.json | jq .</span>
            </div>

            {/* Header comment */}
            <div style={{ marginBottom: '18px' }}>
              <p style={{ color: 'rgba(249,115,22,0.9)' }}>{'// CONSTRUX.NOW — CURRENT.WORK'}</p>
              <p style={{ color: 'rgba(240,239,255,0.2)' }}>{'// AS_OF: ' + BUILD_STAMP}</p>
              <p style={{ color: 'rgba(240,239,255,0.2)' }}>{'// SCOPE: active · pending · ongoing · research'}</p>
            </div>

            {/* Sections */}
            {nowItems.map((section) => {
              const accent = CATEGORY_ACCENT[section.category] ?? '#F97316';
              return (
                <div key={section.category} style={{ marginBottom: '20px' }}>
                  <p style={{ color: `${accent}90`, marginBottom: '6px' }}>
                    {section.category} {'{'}
                  </p>
                  <div style={{ paddingLeft: '20px', borderLeft: `1px solid ${accent}18` }}>
                    {section.items.map((item, idx) => {
                      const meta = STATUS_META[item.status] ?? { color: 'rgba(240,239,255,0.45)', bg: 'rgba(255,255,255,0.04)', indicator: '○' };
                      return (
                        <div key={item.title} style={{ marginBottom: idx < section.items.length - 1 ? '14px' : '0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                            <span style={{ color: meta.color, fontWeight: 600 }}>{meta.indicator}</span>
                            <span style={{ color: 'rgba(240,239,255,0.85)', fontWeight: 600 }}>{item.title}</span>
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 500,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                padding: '1px 6px',
                                background: meta.bg,
                                color: meta.color,
                                borderRadius: '2px',
                                flexShrink: 0,
                              }}
                            >
                              {item.status.replace('_', '.')}
                            </span>
                          </div>
                          <p style={{ color: 'rgba(240,239,255,0.4)', paddingLeft: '18px', fontSize: '11px', lineHeight: '1.65' }}>
                            {item.body}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ color: `${accent}90` }}>{'}'}</p>
                </div>
              );
            })}

            {/* EOF prompt */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ color: 'rgba(240,239,255,0.15)' }}>{'// EOF'}</p>
              <p style={{ marginTop: '10px' }}>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@sys</span>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>:~$ </span>
                <Link
                  href="/journal"
                  style={{ color: 'rgba(249,115,22,0.6)' }}
                  className="hover:text-construx transition-colors"
                >
                  {'→ READ THE JOURNAL'}
                </Link>
              </p>
            </div>
          </div>

          {/* Status bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '5px 14px',
              background: 'rgba(249,115,22,0.06)',
              borderTop: '1px solid rgba(249,115,22,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(74,222,128,0.7)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="status-blink w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#4ade80' }} />
                LIVE
              </span>
              <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>
                {totalItems} ITEMS
              </span>
              <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>
                {inProgress} ACTIVE
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.15)' }}>UTF-8</span>
              <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(249,115,22,0.45)' }}>construx@sys</span>
            </div>
          </div>
        </div>

        {/* Recent commits across all repos */}
        <div className="mt-10">
          <RecentCommitsPanel />
        </div>

        {/* Schedule calendar */}
        <div className="mt-6">
          <TerminalCalPanel />
        </div>

        {/* Scheduled background jobs */}
        <div className="mt-6">
          <CrontabPanel />
        </div>

        {/* Disk usage */}
        <div className="mt-6">
          <DiskUsagePanel />
        </div>

        {/* Disk I/O stats */}
        <div className="mt-6">
          <IostatPanel />
        </div>

        {/* System journal */}
        <div className="mt-6">
          <JournalctlPanel />
        </div>

        {/* Active sessions */}
        <div className="mt-6">
          <WhoPanel />
        </div>

        {/* World clocks */}
        <div className="mt-6 pb-6">
          <TimezoneClockPanel />
        </div>

        {/* Process table */}
        <div className="mt-6 pb-6">
          <PsAuxPanel />
        </div>

        {/* Firewall rules */}
        <div className="mt-6 pb-6">
          <UfwStatusPanel />
        </div>

        {/* Scheduled timers */}
        <div className="mt-6 pb-6">
          <SystemdTimersPanel />
        </div>

        {/* eBPF kernel tracing */}
        <div className="mt-6 pb-6">
          <BpftracePanel />
        </div>

        {/* OpenTelemetry distributed trace waterfall */}
        <div className="mt-6 pb-6">
          <OtelTracesPanel />
        </div>

        {/* WireGuard VPN peer status */}
        <div className="mt-6 pb-6">
          <WireGuardPanel />
        </div>

        {/* systemd service units */}
        <div className="mt-6 pb-6">
          <SystemdStatusPanel />
        </div>

        {/* Disk I/O benchmark */}
        <div className="mt-6 pb-6">
          <FioPanel />
        </div>

        {/* Tokio runtime metrics */}
        <div className="mt-6 pb-6">
          <TokioRuntimePanel />
        </div>

        {/* Vector observability pipeline */}
        <div className="mt-6 pb-6">
          <VectorPipelinePanel />
        </div>

        {/* Cilium eBPF network policy and Hubble flows */}
        <div className="mt-6 pb-6">
          <CiliumPanel />
        </div>

        {/* sysdig syscall tracing — container-aware */}
        <div className="mt-6 pb-6">
          <SysdigPanel />
        </div>

        {/* vegeta HTTP load testing at constant rate */}
        <div className="mt-6 pb-6">
          <VegetaPanel />
        </div>

        {/* dagger portable CI pipelines as code */}
        <div className="mt-6 pb-6">
          <DaggerPanel />
        </div>

        {/* consul service discovery and service mesh */}
        <div className="mt-6 pb-6">
          <ConsulPanel />
        </div>

        {/* KEDA event-driven autoscaling — kafka, prometheus, redis triggers */}
        <div className="mt-6 pb-6">
          <KedaPanel />
        </div>

        {/* SPIFFE/SPIRE workload identity — x.509 SVIDs, zero-trust, no static secrets */}
        <div className="mt-6 pb-6">
          <SpiffePanel />
        </div>

        {/* trino distributed sql — federated queries across iceberg, postgres, kafka */}
        <div className="mt-6 pb-6">
          <TrinoPanel />
        </div>

        {/* pulsar multi-tenant messaging — geo-replication, tiered storage, bookkeeper */}
        <div className="mt-6 pb-6">
          <PulsarPanel />
        </div>

        {/* vault pki internal ca — intermediate ca, issue, rotate, k8s-auth */}
        <div className="mt-6 pb-6">
          <VaultPkiPanel />
        </div>

        {/* apache airflow dag orchestration — celery, sensor, xcom, dynamic tasks */}
        <div className="mt-6 pb-6">
          <AirflowPanel />
        </div>

        {/* cloudflare workers — edge compute, kv, r2, d1, durable objects */}
        <div className="mt-6 pb-6">
          <CloudflareWorkersPanel />
        </div>

        {/* delta lake acid lakehouse — medallion, tx log, zorder, vacuum, time travel */}
        <div className="mt-6 pb-6">
          <DeltaLakePanel />
        </div>

        {/* kube-state-metrics k8s object health — resource readiness, firing alerts, series */}
        <div className="mt-6 pb-6">
          <KubeStateMetricsPanel />
        </div>

        {/* prow kubernetes ci — jobs, tide merge pools, pass rates */}
        <div className="mt-6 pb-6">
          <ProwPanel />
        </div>

        {/* dns zones and records — dnssec, spf, dmarc, resolver cache */}
        <div className="mt-6 pb-6">
          <DragonFlyDnsPanel />
        </div>

        {/* grafana pyroscope continuous profiling — pprof, flamegraph, ebpf */}
        <div className="mt-6 pb-6">
          <PyroscopePanel />
        </div>

        {/* kubeflow mlops — pipelines, experiments, training runs, gpu hours */}
        <div className="mt-6 pb-6">
          <KubeflowPanel />
        </div>

        {/* keycloak cloud-native iam — realms, clients, active sessions, tokens */}
        <div className="mt-6 pb-6">
          <KeycloakPanel />
        </div>

        {/* mlflow ml experiment tracking — experiments, runs, metrics, artifacts */}
        <div className="mt-6 pb-6">
          <MLflowPanel />
        </div>

        {/* promtail loki log shipper — scrape targets, pipeline stages */}
        <div className="mt-6 pb-6">
          <PromtailPanel />
        </div>

        {/* falco runtime security — syscall rules, k8s audit, alerts */}
        <div className="mt-6 pb-6">
          <FalcoPanel />
        </div>

        {/* tailscale zero-config vpn — wireguard mesh, devices, acl */}
        <div className="mt-6 pb-6">
          <TailscalePanel />
        </div>

        {/* otel collector telemetry pipeline — traces, metrics, logs */}
        <div className="mt-6 pb-6">
          <OtelCollectorPanel />
        </div>

        {/* teleport infrastructure access — nodes, sessions, audit */}
        <div className="mt-6 pb-6">
          <TeleportPanel />
        </div>

        {/* cert-manager tls automation — certificates, issuers, acme */}
        <div className="mt-6 pb-6">
          <CertManagerPanel />
        </div>

        {/* tekton k8s-native ci — pipelineruns, taskruns, workspaces */}
        <div className="mt-6 pb-6">
          <TektonPanel />
        </div>

        {/* kubevirt vms on kubernetes — virtual machines, snapshots, migrations */}
        <div className="mt-6 pb-6">
          <KubeVirtPanel />
        </div>

        {/* kube-prometheus full monitoring stack — dashboards, servicemonitors, rules */}
        <div className="mt-6 pb-6">
          <KubePrometheusPanel />
        </div>

        {/* kubeaudit k8s security audit — findings, namespaces, remediation */}
        <div className="mt-6 pb-6">
          <KubeAuditPanel />
        </div>

        {/* grype vulnerability scanner — images, cves, sbom */}
        <div className="mt-6 pb-6">
          <GrypePanel />
        </div>

        {/* thanos ha prometheus — stores, querier, compaction */}
        <div className="mt-6 pb-6">
          <ThanosPanel />
        </div>

        {/* tetragon ebpf security — policies, execs, connects */}
        <div className="mt-6 pb-6">
          <TetragonPanel />
        </div>

        {/* grafana tempo distributed tracing — traces, spans, services */}
        <div className="mt-6 pb-6">
          <GrafanaTempoPanel />
        </div>

        {/* grafana oncall incident management — schedules, alerts, escalations */}
        <div className="mt-6 pb-6">
          <GrafanaOnCallPanel />
        </div>

        {/* skaffold kubernetes dev workflow — builds, deploys, sync */}
        <div className="mt-6 pb-6">
          <SkaffoldPanel />
        </div>

        {/* mise tool version management — tools, versions, envs */}
        <div className="mt-6 pb-6">
          <MisePanel />
        </div>

        {/* git worktree parallel branches — worktrees, status, commits */}
        <div className="mt-6 pb-6">
          <GitWorktreePanel />
        </div>

        {/* git blame annotate — commits, authors, lines */}
        <div className="mt-6 pb-6">
          <GitBlamePanel />
        </div>

        {/* nats jetstream — streams, consumers, messages, acks */}
        <div className="mt-6 pb-6">
          <NATSJetStreamPanel />
        </div>

        {/* airbyte open-source elt — connectors, syncs, data movement */}
        <div className="mt-6 pb-6">
          <AirbytePanel />
        </div>

        {/* flink stateful stream processing — exactly-once, windows, checkpoints */}
        <div className="mt-6 pb-6">
          <FlinkPanel />
        </div>

        {/* goreleaser — release automation, binaries, docker, changelog */}
        <div className="mt-6 pb-6">
          <GoReleaserPanel />
        </div>

        {/* dapr distributed application runtime — actors, pub/sub, state */}
        <div className="mt-6 pb-6">
          <DaprPanel />
        </div>

        {/* atlas database schema management — migrations, drift, ci */}
        <div className="mt-6 pb-6">
          <AtlasPanel />
        </div>

        {/* debezium change data capture — connectors, events, offsets */}
        <div className="mt-6 pb-6">
          <DebeziumPanel />
        </div>

        {/* qdrant — vector database, collections, search, embeddings */}
        <div className="mt-6 pb-6">
          <QdrantPanel />
        </div>

        {/* beyla — ebpf auto-instrumentation, spans, latency */}
        <div className="mt-6 pb-6">
          <BeylaPanel />
        </div>

        {/* containerd — container runtime, images, snapshots, tasks */}
        <div className="mt-6 pb-6">
          <ContainerdPanel />
        </div>

        {/* docker stats — cpu, mem, net, block per container */}
        <div className="mt-6 pb-6">
          <DockerStatsPanel />
        </div>

        {/* free mem — memory usage, buffers, cache, available */}
        <div className="mt-6 pb-6">
          <FreeMemPanel />
        </div>

        {/* gh cli — repos, prs, issues, workflows, releases */}
        <div className="mt-6 pb-6">
          <GhCliPanel />
        </div>

        {/* helm chart — templates, values, releases, rollbacks */}
        <div className="mt-6 pb-6">
          <HelmChartPanel />
        </div>

        {/* journald word count — message rates, units, priorities */}
        <div className="mt-6 pb-6">
          <JournalWcPanel />
        </div>

        {/* k9s — tui kubernetes dashboard, pods, logs, exec */}
        <div className="mt-6 pb-6">
          <K9sPanel />
        </div>

        {/* kubebench — cis benchmark, controls, remediation, pass rate */}
        <div className="mt-6 pb-6">
          <KubebenchPanel />
        </div>

        {/* kube proxy — services, iptables, endpoints, modes */}
        <div className="mt-6 pb-6">
          <KubeProxyPanel />
        </div>

        {/* loki query — logql, streams, range, instant queries */}
        <div className="mt-6 pb-6">
          <LokiQueryPanel />
        </div>

        {/* meminfo — ram, swap, buffers, cached, available */}
        <div className="mt-6 pb-6">
          <MemInfoPanel />
        </div>

        {/* bundle analysis — chunks, modules, size, tree */}
        <div className="mt-6 pb-6">
          <BundleAnalysisPanel />
        </div>

        {/* coverage report — lines, branches, functions, uncovered */}
        <div className="mt-6 pb-6">
          <CoverageReportPanel />
        </div>

        {/* env — variables, secrets, overrides, dotenv */}
        <div className="mt-6 pb-6">
          <EnvPanel />
        </div>

        {/* nats pub/sub — subjects, messages, consumers, streams */}
        <div className="mt-6 pb-6">
          <NatsPubSubPanel />
        </div>

        {/* nftables — chains, rules, sets, counters */}
        <div className="mt-6 pb-6">
          <NftablesPanel />
        </div>

        {/* npm outdated — packages, current, wanted, latest */}
        <div className="mt-6 pb-6">
          <NpmOutdatedPanel />
        </div>

        {/* opensearch — indices, shards, queries, cluster health */}
        <div className="mt-6 pb-6">
          <OpenSearchPanel />
        </div>

        {/* pg explain — plan, cost, rows, nodes, buffers */}
        <div className="mt-6 pb-6">
          <PgExplainPanel />
        </div>

        {/* prometheus alert — rules, state, severity, labels */}
        <div className="mt-6 pb-6">
          <PrometheusAlertPanel />
        </div>

        {/* rekor — transparency log, signatures, checksums, artifacts */}
        <div className="mt-6 pb-6">
          <RekorPanel />
        </div>

        {/* rss feed — items, dates, channels, enclosures */}
        <div className="mt-6 pb-6">
          <RssFeedPanel />
        </div>

        {/* scylla — tablets, vnodes, repairs, compactions */}
        <div className="mt-6 pb-6">
          <ScyllaPanel />
        </div>

        {/* sentry — issues, errors, events, alerts */}
        <div className="mt-6 pb-6">
          <SentryIssuesPanel />
        </div>

        {/* sonarqube — code quality, coverage, issues, gates */}
        <div className="mt-6 pb-6">
          <SonarQubePanel />
        </div>

        {/* strace summary — syscalls, latency, errors, signals */}
        <div className="mt-6 pb-6">
          <StraceSummaryPanel />
        </div>

        {/* tailnet status — devices, tailscale, acl, routes */}
        <div className="mt-6 pb-6">
          <TailnetStatusPanel />
        </div>

        {/* vmstat — memory, swap, io, cpu, system counters */}
        <div className="mt-6 pb-6">
          <VmstatPanel />
        </div>

        {/* web vitals — lcp, fid, cls, ttfb, inp performance */}
        <div className="mt-6 pb-6">
          <WebVitalsPanel />
        </div>

        {/* weaviate — vector db, classes, objects, hybrid search */}
        <div className="mt-6 pb-6">
          <WeaviatePanel />
        </div>

        {/* vscode extensions — installed, recommended, marketplace */}
        <div className="mt-6 pb-6">
          <VscodeExtensionsPanel />
        </div>

        {/* zitadel — iam, oidc, saml, organizations, audit */}
        <div className="mt-6 pb-6">
          <ZitadelPanel />
        </div>

        {/* alertmanager — prometheus alerts, groups, silences, receivers */}
        <div className="mt-6 pb-6">
          <AlertManagerPanel />
        </div>

        {/* ansible playbook — tasks, hosts, roles, handlers, inventory */}
        <div className="mt-6 pb-6">
          <AnsiblePlaybookPanel />
        </div>

        {/* act — github actions local runner, jobs, steps, env */}
        <div className="mt-6 pb-6">
          <ActPanel />
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
        <div className="mt-6 pb-10">
          <AwsCliPanel />
        </div>

        <div className="mt-6 pt-8 border-t border-border">
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
