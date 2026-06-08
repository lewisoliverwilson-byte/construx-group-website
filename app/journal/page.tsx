import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate as fd } from '@/lib/utils';
import ActivityHistogram from '@/components/journal/ActivityHistogram';
import JournalStats from '@/components/journal/JournalStats';
import DispatchCalendar from '@/components/journal/DispatchCalendar';
import DispatchGitLog from '@/components/journal/DispatchGitLog';
import JournalWcPanel from '@/components/JournalWcPanel';
import TechFreqPanel from '@/components/TechFreqPanel';
import SitemapIndexPanel from '@/components/SitemapIndexPanel';
import RssFeedPanel from '@/components/RssFeedPanel';
import HttpArchivePanel from '@/components/HttpArchivePanel';
import WebVitalsPanel from '@/components/WebVitalsPanel';
import GitBlamePanel from '@/components/GitBlamePanel';
import GhCliPanel from '@/components/GhCliPanel';
import AwsCliPanel from '@/components/AwsCliPanel';
import TrivyScanPanel from '@/components/TrivyScanPanel';
import DbMigrationPanel from '@/components/DbMigrationPanel';
import BunBuildPanel from '@/components/BunBuildPanel';
import SbomPanel from '@/components/SbomPanel';
import NatsPubSubPanel from '@/components/NatsPubSubPanel';
import SentryIssuesPanel from '@/components/SentryIssuesPanel';
import PgvectorPanel from '@/components/PgvectorPanel';
import MeilisearchPanel from '@/components/MeilisearchPanel';
import DuckdbPanel from '@/components/DuckdbPanel';
import GoReleaserPanel from '@/components/GoReleaserPanel';
import SkaffoldPanel from '@/components/SkaffoldPanel';
import GrafanaAlloyPanel from '@/components/GrafanaAlloyPanel';
import KyvernoPanel from '@/components/KyvernoPanel';
import DebeziumPanel from '@/components/DebeziumPanel';
import KnativePanel from '@/components/KnativePanel';
import KubeVirtPanel from '@/components/KubeVirtPanel';
import SpiceDbPanel from '@/components/SpiceDbPanel';
import BeylaPanel from '@/components/BeylaPanel';
import NftablesPanel from '@/components/NftablesPanel';
import K3sPanel from '@/components/K3sPanel';
import FluentBitPanel from '@/components/FluentBitPanel';
import AtlasPanel from '@/components/AtlasPanel';
import LokiPanel from '@/components/LokiPanel';
import NetdataPanel from '@/components/NetdataPanel';
import NeonPanel from '@/components/NeonPanel';
import LangfusePanel from '@/components/LangfusePanel';
import HuggingFacePanel from '@/components/HuggingFacePanel';
import SigstorePanel from '@/components/SigstorePanel';
import PgBouncerPanel from '@/components/PgBouncerPanel';
import JfrogXrayPanel from '@/components/JfrogXrayPanel';
import RenovatePanel from '@/components/RenovatePanel';
import RekorPanel from '@/components/RekorPanel';
import TypesensePanel from '@/components/TypesensePanel';
import ArgoCDPanel from '@/components/ArgoCDPanel';
import CosignPanel from '@/components/CosignPanel';
import HarborPanel from '@/components/HarborPanel';
import SynapsePanel from '@/components/SynapsePanel';
import SeaweedFSPanel from '@/components/SeaweedFSPanel';
import ScyllaPanel from '@/components/ScyllaPanel';
import OpenSearchPanel from '@/components/OpenSearchPanel';
import DruidPanel from '@/components/DruidPanel';
import SyftPanel from '@/components/SyftPanel';
import ScorecardPanel from '@/components/ScorecardPanel';
import LighthousePanel from '@/components/LighthousePanel';
import BundleAnalysisPanel from '@/components/BundleAnalysisPanel';
import FlinkPanel from '@/components/FlinkPanel';
import AirflowPanel from '@/components/AirflowPanel';
import CiliumPanel from '@/components/CiliumPanel';
import AirbytePanel from '@/components/AirbytePanel';
import DaprPanel from '@/components/DaprPanel';
import NATSJetStreamPanel from '@/components/NATSJetStreamPanel';
import SpiffePanel from '@/components/SpiffePanel';
import ChaosMeshPanel from '@/components/ChaosMeshPanel';
import BazelPanel from '@/components/BazelPanel';
import CertManagerPanel from '@/components/CertManagerPanel';
import ClusterApiPanel from '@/components/ClusterApiPanel';
import CertInfoPanel from '@/components/CertInfoPanel';
import CrunchyPostgresPanel from '@/components/CrunchyPostgresPanel';
import DiskUsagePanel from '@/components/DiskUsagePanel';
import DnsLookupPanel from '@/components/DnsLookupPanel';
import FlaggerPanel from '@/components/FlaggerPanel';
import GitShortlogPanel from '@/components/GitShortlogPanel';
import GrpcCallPanel from '@/components/GrpcCallPanel';
import IcebergPanel from '@/components/IcebergPanel';
import JaegerTracePanel from '@/components/JaegerTracePanel';
import CaddyAccessPanel from '@/components/CaddyAccessPanel';
import CrontabPanel from '@/components/CrontabPanel';
import DigPanel from '@/components/DigPanel';
import GpgFingerprintPanel from '@/components/GpgFingerprintPanel';
import K6Panel from '@/components/K6Panel';
import KubeflowPanel from '@/components/KubeflowPanel';
import LastLoginPanel from '@/components/LastLoginPanel';
import MemInfoPanel from '@/components/MemInfoPanel';
import NATSPanel from '@/components/NATSPanel';
import OPAPanel from '@/components/OPAPanel';
import OtelTracesPanel from '@/components/OtelTracesPanel';
import PinotPanel from '@/components/PinotPanel';
import PprofPanel from '@/components/PprofPanel';
import PromtailPanel from '@/components/PromtailPanel';
import RecentCommitsPanel from '@/components/RecentCommitsPanel';
import RisingWavePanel from '@/components/RisingWavePanel';
import UptimePanel from '@/components/UptimePanel';
import TiDbPanel from '@/components/TiDbPanel';
import TraefikPanel from '@/components/TraefikPanel';
import TankaPanel from '@/components/TankaPanel';
import TrinoPanel from '@/components/TrinoPanel';
import TlsHandshakePanel from '@/components/TlsHandshakePanel';
import AlertManagerPanel from '@/components/AlertManagerPanel';
import ActPanel from '@/components/ActPanel';
import AnsiblePlaybookPanel from '@/components/AnsiblePlaybookPanel';
import ArgoEventsPanel from '@/components/ArgoEventsPanel';
import ArgoRolloutPanel from '@/components/ArgoRolloutPanel';
import ArgoWorkflowsPanel from '@/components/ArgoWorkflowsPanel';
import AuditdPanel from '@/components/AuditdPanel';
import AuthentikPanel from '@/components/AuthentikPanel';
import AwsBedrockPanel from '@/components/AwsBedrockPanel';
import BackstagePanel from '@/components/BackstagePanel';
import BenthosPanel from '@/components/BenthosPanel';
import BgpLookupPanel from '@/components/BgpLookupPanel';
import BiomePanel from '@/components/BiomePanel';
import BoundaryPanel from '@/components/BoundaryPanel';
import BpftracePanel from '@/components/BpftracePanel';
import BrewListPanel from '@/components/BrewListPanel';
import BufPanel from '@/components/BufPanel';
import BuildOutputPanel from '@/components/BuildOutputPanel';
import CaddyPanel from '@/components/CaddyPanel';
import CargoPanel from '@/components/CargoPanel';
import CassandraPanel from '@/components/CassandraPanel';
import CephPanel from '@/components/CephPanel';
import CgroupsPanel from '@/components/CgroupsPanel';
import CIPipelinePanel from '@/components/CIPipelinePanel';
import CitusPanel from '@/components/CitusPanel';
import ClickHouseKeeperPanel from '@/components/ClickHouseKeeperPanel';
import ClickhouseMigrationPanel from '@/components/ClickhouseMigrationPanel';
import ClickhouseMvPanel from '@/components/ClickhouseMvPanel';
import ClickHousePanel from '@/components/ClickHousePanel';
import ClickhouseQueryPanel from '@/components/ClickhouseQueryPanel';
import CloudflareWorkersPanel from '@/components/CloudflareWorkersPanel';
import CloudNativePGPanel from '@/components/CloudNativePGPanel';
import CniPanel from '@/components/CniPanel';
import CockroachDbPanel from '@/components/CockroachDbPanel';
import ConsulPanel from '@/components/ConsulPanel';
import ContainerdPanel from '@/components/ContainerdPanel';
import CortexPanel from '@/components/CortexPanel';
import CoverageReportPanel from '@/components/CoverageReportPanel';
import CpuStatsPanel from '@/components/CpuStatsPanel';
import CrossplanePanel from '@/components/CrossplanePanel';
import CuePanel from '@/components/CuePanel';
import CurlHeadersPanel from '@/components/CurlHeadersPanel';
import CurlJwtPanel from '@/components/CurlJwtPanel';
import CurlVerbosePanel from '@/components/CurlVerbosePanel';
import CycloneDxPanel from '@/components/CycloneDxPanel';
import DaggerPanel from '@/components/DaggerPanel';
import DbtPanel from '@/components/DbtPanel';
import DeltaLakePanel from '@/components/DeltaLakePanel';
import DmesgPanel from '@/components/DmesgPanel';
import DockerBuildPanel from '@/components/DockerBuildPanel';
import DockerComposePanel from '@/components/DockerComposePanel';
import DockerStatsPanel from '@/components/DockerStatsPanel';
import DragonFlyDnsPanel from '@/components/DragonFlyDnsPanel';
import DragonflyPanel from '@/components/DragonflyPanel';
import DronePanel from '@/components/DronePanel';
import EarthlyPanel from '@/components/EarthlyPanel';
import EbpfTracePanel from '@/components/EbpfTracePanel';
import EnvoyPanel from '@/components/EnvoyPanel';
import EnvoyStatsPanel from '@/components/EnvoyStatsPanel';
import EnvPanel from '@/components/EnvPanel';
import EslintOutputPanel from '@/components/EslintOutputPanel';
import EtcdPanel from '@/components/EtcdPanel';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Build-in-public posts and insight pieces from Construx Group. The honest record of what we build and how.',
};

const TAG_PALETTE: Record<string, { accent: string; bg: string; border: string; rowBorder: string }> = {
  Strategy:    { accent: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.22)',  rowBorder: 'rgba(249,115,22,0.28)' },
  'Build Log': { accent: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.22)',  rowBorder: 'rgba(74,222,128,0.28)' },
  Product:     { accent: '#7dd3fc', bg: 'rgba(125,211,252,0.1)', border: 'rgba(125,211,252,0.22)', rowBorder: 'rgba(125,211,252,0.28)' },
  Methodology: { accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.22)', rowBorder: 'rgba(167,139,250,0.28)' },
  Process:     { accent: '#67e8f9', bg: 'rgba(103,232,249,0.1)', border: 'rgba(103,232,249,0.22)',  rowBorder: 'rgba(103,232,249,0.28)' },
};

const DEFAULT_PALETTE = TAG_PALETTE.Strategy;

interface Props {
  searchParams: Promise<{ tag?: string }>;
}

export default async function JournalPage({ searchParams }: Props) {
  const { tag: activeTag } = await searchParams;
  const allPosts = getAllPostMeta();
  const posts = activeTag ? allPosts.filter((p) => p.tag === activeTag) : allPosts;
  const tags = [...new Set(allPosts.map((p) => p.tag))].sort();

  // Activity histogram data
  const monthCounts = new Map<string, number>();
  allPosts.forEach((p) => {
    const key = p.date.slice(0, 7);
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  });
  const sortedMonths = [...monthCounts.entries()].sort(([a], [b]) => a.localeCompare(b));
  const maxCount = Math.max(...sortedMonths.map(([, c]) => c), 1);
  const histogramBars = sortedMonths.map(([key, count]) => ({
    label: new Date(key + '-02').toLocaleString('en', { month: 'short' }),
    count,
    pct: count / maxCount,
  }));

  const dateCounts: Record<string, number> = {};
  allPosts.forEach((p) => {
    dateCounts[p.date] = (dateCounts[p.date] ?? 0) + 1;
  });

  const totalReadingTime = allPosts.reduce((sum, p) => sum + p.readingTime, 0);
  const avgReadingTime = allPosts.length > 0 ? Math.round(totalReadingTime / allPosts.length) : 0;
  const peakMonthEntry = sortedMonths.reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0]);
  const peakMonthLabel = peakMonthEntry[0]
    ? new Date(peakMonthEntry[0] + '-02').toLocaleString('en', { month: 'short', year: '2-digit' })
    : '—';
  const statsRows = [
    { label: 'DISPATCHES', value: String(allPosts.length).padStart(3, '0'), accent: '#F97316' },
    { label: 'READ TIME', value: `${totalReadingTime}m`, accent: 'rgba(240,239,255,0.85)' },
    { label: 'AVG LENGTH', value: `${avgReadingTime}m`, accent: 'rgba(240,239,255,0.85)' },
    { label: 'PEAK MONTH', value: peakMonthLabel, accent: 'rgba(103,232,249,0.85)' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4 animate-fade-in">
            // BUILD IN PUBLIC
          </p>
          <h1
            className="text-display text-text-base mb-5 leading-none animate-fade-up"
            style={{ animationDelay: '90ms', animationFillMode: 'both' }}
          >
            The <span className="text-gradient-orange">Journal</span>
          </h1>
          <p
            className="text-text-muted text-base leading-relaxed max-w-lg animate-fade-up"
            style={{ animationDelay: '220ms', animationFillMode: 'both' }}
          >
            The honest record of what we're building, how we're building it,
            and what AI at the frontier actually looks like in practice.
          </p>

          <div
            className="flex items-center gap-4 mt-6 animate-fade-up"
            style={{ animationDelay: '350ms', animationFillMode: 'both' }}
          >
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-construx opacity-70" />
              {String(allPosts.length).padStart(3, '0')} DISPATCHES
            </span>
            {activeTag ? (
              <span className="font-mono text-[9px] text-construx uppercase tracking-[0.2em]">
                FILTER: {activeTag}
              </span>
            ) : (
              <span className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em]">
                SIGNAL: LIVE
              </span>
            )}
          </div>

          {!activeTag && <JournalStats rows={statsRows} />}
          {!activeTag && <DispatchCalendar dateCounts={dateCounts} />}

          {/* Tag filter chips */}
          <div
            className="flex flex-wrap gap-2 mt-4 animate-fade-up"
            style={{ animationDelay: '440ms', animationFillMode: 'both' }}
          >
            {tags.map((tag) => {
              const count = allPosts.filter((p) => p.tag === tag).length;
              const isActive = activeTag === tag;
              const palette = TAG_PALETTE[tag] ?? DEFAULT_PALETTE;
              return (
                <Link
                  key={tag}
                  href={isActive ? '/journal' : `/journal?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[9px] font-medium px-2.5 py-1 uppercase tracking-widest transition-all"
                  style={{
                    background: isActive ? palette.bg : 'rgba(255,255,255,0.04)',
                    border: isActive ? `1px solid ${palette.border}` : '1px solid rgba(255,255,255,0.08)',
                    color: isActive ? palette.accent : 'rgba(240,239,255,0.45)',
                    borderRadius: '2px',
                  }}
                >
                  {tag}
                  {isActive ? (
                    <X size={9} />
                  ) : (
                    <span style={{ color: palette.accent, opacity: 0.6 }}>{count}</span>
                  )}
                </Link>
              );
            })}
            {activeTag && (
              <Link
                href="/journal"
                className="inline-flex items-center gap-1 font-mono text-[9px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest px-2 py-1"
              >
                <X size={9} /> Clear filter
              </Link>
            )}
          </div>

          {/* Activity histogram */}
          {!activeTag && (
            <ActivityHistogram bars={histogramBars} total={allPosts.length} />
          )}

          {/* Git commit log */}
          {!activeTag && (
            <DispatchGitLog posts={allPosts} total={allPosts.length} />
          )}
        </div>
      </section>

      {/* Word count analysis */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <JournalWcPanel />
      </section>

      {/* Tech term frequency */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <TechFreqPanel />
      </section>

      {/* Sitemap index */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SitemapIndexPanel />
      </section>

      {/* RSS feed */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <RssFeedPanel />
      </section>

      {/* HTTP archive / request waterfall */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <HttpArchivePanel />
      </section>

      {/* Core Web Vitals */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <WebVitalsPanel />
      </section>

      {/* Git blame — source authorship */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <GitBlamePanel />
      </section>

      {/* GitHub CLI — org repos, PRs, issues */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <GhCliPanel />
      </section>

      {/* AWS CLI — Amplify apps, S3, CloudWatch */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <AwsCliPanel />
      </section>

      {/* Trivy container vulnerability scan */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <TrivyScanPanel />
      </section>

      {/* Drizzle migration status */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DbMigrationPanel />
      </section>

      {/* Bun build output */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BunBuildPanel />
      </section>

      {/* SBOM — software bill of materials */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SbomPanel />
      </section>

      {/* NATS pub/sub message stream */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <NatsPubSubPanel />
      </section>

      {/* Sentry error tracking issues */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SentryIssuesPanel />
      </section>

      {/* pgvector semantic search */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <PgvectorPanel />
      </section>

      {/* Meilisearch full-text search */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <MeilisearchPanel />
      </section>

      {/* DuckDB analytical SQL on parquet */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <DuckdbPanel />
      </section>

      {/* GoReleaser multi-platform build and release */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <GoReleaserPanel />
      </section>

      {/* skaffold kubernetes inner-loop development */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SkaffoldPanel />
      </section>

      {/* grafana alloy unified observability pipeline */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <GrafanaAlloyPanel />
      </section>

      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <KyvernoPanel />
      </section>

      {/* debezium WAL-based CDC — postgres change events to kafka */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <DebeziumPanel />
      </section>

      {/* knative serving — scale-to-zero, traffic split, KPA, revision model */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <KnativePanel />
      </section>

      {/* kubevirt vms on kubernetes — live migration, cdi, virt-launcher, virtctl */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <KubeVirtPanel />
      </section>

      {/* spicedb zanzibar authz — schema, check, expand, watch, zookies */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SpiceDbPanel />
      </section>

      {/* grafana beyla ebpf auto-instrumentation — RED metrics, traces, zero-code */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <BeylaPanel />
      </section>

      {/* nftables netfilter — tables, chains, rules, packet/byte counters */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <NftablesPanel />
      </section>

      {/* k3s lightweight kubernetes — nodes, system pods, built-in components */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <K3sPanel />
      </section>

      {/* fluent bit log processor — inputs, outputs, loki/s3/opensearch pipeline */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <FluentBitPanel />
      </section>

      {/* atlas schema migrations — versioned, lint, apply history */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <AtlasPanel />
      </section>

      {/* grafana loki log aggregation — streams, logql, ingest rate */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <LokiPanel />
      </section>

      {/* netdata real-time monitoring — nodes, metrics, alarms */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <NetdataPanel />
      </section>

      {/* neon serverless postgres — projects, branches, instant branching */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <NeonPanel />
      </section>

      {/* langfuse llm observability — traces, evaluations, token cost */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <LangfusePanel />
      </section>

      {/* huggingface hub — model registry, inference, fine-tunes */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <HuggingFacePanel />
      </section>

      {/* sigstore keyless signing — cosign, rekor, transparency log */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <SigstorePanel />
      </section>

      {/* pgbouncer postgres connection pooler — pools, stats, modes */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <PgBouncerPanel />
      </section>

      {/* jfrog xray artifact security — repos, policies, violations */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <JfrogXrayPanel />
      </section>

      {/* renovate dependency automation — repos, updates, automerge */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <RenovatePanel />
      </section>

      {/* rekor transparency log — signed artifacts, monitors, merkle tree */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <RekorPanel />
      </section>

      {/* typesense instant search — collections, queries, analytics */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <TypesensePanel />
      </section>

      {/* argocd gitops cd — apps, sync, health */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ArgoCDPanel />
      </section>

      {/* cosign artifact signing — signatures, keyless, tlog */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CosignPanel />
      </section>

      {/* harbor container registry — projects, images, vulnerability scanning */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <HarborPanel />
      </section>

      {/* synapse matrix homeserver — rooms, federation, e2ee */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <SynapsePanel />
      </section>

      {/* seaweedfs distributed file system — volumes, filer, s3-compatible */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <SeaweedFSPanel />
      </section>

      {/* grafana loki log aggregation — streams, logql, ingester */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <LokiPanel />
      </section>

      {/* scylladb low-latency nosql — nodes, ring, cql */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ScyllaPanel />
      </section>

      {/* opensearch distributed search — indices, shards, queries */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <OpenSearchPanel />
      </section>

      {/* druid real-time analytics — datasources, segments, tasks */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DruidPanel />
      </section>

      {/* syft sbom generation — packages, licenses, vulnerabilities */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <SyftPanel />
      </section>

      {/* scorecard security scoring — checks, scores, badges */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ScorecardPanel />
      </section>

      {/* lighthouse performance audit — scores, metrics, opportunities */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <LighthousePanel />
      </section>

      {/* bundle analysis — chunks, sizes, tree shaking */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BundleAnalysisPanel />
      </section>

      {/* flink stateful stream processing — exactly-once, windows, checkpoints */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <FlinkPanel />
      </section>

      {/* airflow dag orchestration — celery, sensors, xcom, dynamic tasks */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <AirflowPanel />
      </section>

      {/* cilium ebpf networking — endpoints, policy, hubble flows */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CiliumPanel />
      </section>

      {/* airbyte open-source elt — connectors, syncs, data movement */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <AirbytePanel />
      </section>

      {/* dapr distributed application runtime — actors, pub/sub, state */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DaprPanel />
      </section>

      {/* nats jetstream — streams, consumers, messages, acks */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <NATSJetStreamPanel />
      </section>

      {/* spiffe workload identity — svids, trust bundles, federation */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <SpiffePanel />
      </section>

      {/* chaos mesh — fault injection, experiments, network chaos */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ChaosMeshPanel />
      </section>

      {/* bazel — build system, targets, deps, cache */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BazelPanel />
      </section>

      {/* cert-manager — certificate lifecycle, issuers, renewals */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CertManagerPanel />
      </section>

      {/* cluster api — machine management, providers, bootstrap */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ClusterApiPanel />
      </section>

      {/* cert info — tls certificate details, san, validity, chain */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CertInfoPanel />
      </section>

      {/* crunchy postgres — clusters, ha, backup, monitoring */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CrunchyPostgresPanel />
      </section>

      {/* disk usage — mount points, sizes, used, available */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DiskUsagePanel />
      </section>

      {/* dns lookup — queries, records, ttl, resolver */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DnsLookupPanel />
      </section>

      {/* flagger — canary analysis, metrics, webhooks, traffic */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <FlaggerPanel />
      </section>

      {/* git shortlog — contributors, commits, range summary */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <GitShortlogPanel />
      </section>

      {/* grpc call — methods, status codes, duration, metadata */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <GrpcCallPanel />
      </section>

      {/* iceberg — table format, snapshots, partitions, manifests */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <IcebergPanel />
      </section>

      {/* jaeger trace — spans, services, operations, latency */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <JaegerTracePanel />
      </section>

      {/* caddy access — requests, status, latency, paths */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CaddyAccessPanel />
      </section>

      {/* crontab — jobs, schedule, user, command */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CrontabPanel />
      </section>

      {/* dig — dns query, records, ttl, authority */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DigPanel />
      </section>

      {/* gpg fingerprint — key id, uid, subkeys, trust */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <GpgFingerprintPanel />
      </section>

      {/* k6 — vus, rps, checks, errors, duration */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <K6Panel />
      </section>

      {/* kubeflow — pipelines, runs, experiments, artifacts */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <KubeflowPanel />
      </section>

      {/* last login — users, terminals, ips, timestamps */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <LastLoginPanel />
      </section>

      {/* meminfo — ram, swap, buffers, cached, available */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <MemInfoPanel />
      </section>

      {/* nats — streams, consumers, subjects, messages */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <NATSPanel />
      </section>

      {/* opa — policies, decisions, bundles, rego */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <OPAPanel />
      </section>

      {/* otel traces — spans, services, operations, latency */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <OtelTracesPanel />
      </section>

      {/* pinot — tables, segments, queries, realtime */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <PinotPanel />
      </section>

      {/* pprof — heap, cpu, goroutines, mutex, block */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <PprofPanel />
      </section>

      {/* promtail — scrape targets, pipeline stages, loki push */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <PromtailPanel />
      </section>

      {/* recent commits — sha, author, message, timestamp */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <RecentCommitsPanel />
      </section>

      {/* risingwave — streaming sql, materialized views, incremental */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <RisingWavePanel />
      </section>

      {/* uptime — system uptime, load average, users, processes */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <UptimePanel />
      </section>

      {/* tidb htap — tikv row storage, tiflash columnar, raft */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <TiDbPanel />
      </section>

      {/* traefik — reverse proxy, routers, services, tls */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <TraefikPanel />
      </section>

      {/* tanka jsonnet k8s config — environments, drift diff, applied objects */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <TankaPanel />
      </section>

      {/* trino distributed sql — federated queries, iceberg, postgres, kafka */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <TrinoPanel />
      </section>

      {/* tls handshake — client hello, cipher suite, certificates, session */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <TlsHandshakePanel />
      </section>

      {/* alertmanager — prometheus alerts, groups, silences, receivers */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <AlertManagerPanel />
      </section>

      {/* act — github actions local runner, jobs, steps, env */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ActPanel />
      </section>

      {/* ansible playbook — tasks, hosts, roles, handlers, inventory */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <AnsiblePlaybookPanel />
      </section>

      {/* argo events — event-driven workflows, event sources, sensors, triggers */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ArgoEventsPanel />
      </section>

      {/* argo rollout — progressive delivery, canary, bluegreen, analysis */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ArgoRolloutPanel />
      </section>

      {/* argo workflows — dag pipelines, ml training, artifacts, parallel steps */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ArgoWorkflowsPanel />
      </section>

      {/* auditd linux audit framework — syscalls, events, rules, trails */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <AuditdPanel />
      </section>

      {/* authentik identity provider — sso, oauth2, saml, audit */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <AuthentikPanel />
      </section>

      {/* aws bedrock — foundation models, inference, agents */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <AwsBedrockPanel />
      </section>

      {/* backstage developer portal — catalog, tech radar, plugins */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BackstagePanel />
      </section>

      {/* benthos stream processor — pipelines, bloblang, fanout */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BenthosPanel />
      </section>

      {/* bgp routing table lookup — asn, prefixes, peers, path */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BgpLookupPanel />
      </section>

      {/* biome js toolchain — lint, format, check, ci */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BiomePanel />
      </section>

      {/* boundary zero-trust infrastructure access — targets, sessions, policies */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BoundaryPanel />
      </section>

      {/* bpftrace kernel tracing — probes, maps, scripts, hist */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BpftracePanel />
      </section>

      {/* brew list — installed formulae, casks, versions */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BrewListPanel />
      </section>

      {/* buf protobuf lint, breaking, generate, push */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BufPanel />
      </section>

      {/* build output — compile steps, warnings, errors, timing */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <BuildOutputPanel />
      </section>

      {/* caddy reverse proxy — routes, tls, upstreams, logs */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CaddyPanel />
      </section>

      {/* cargo release build — compile, link, test, artifact */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CargoPanel />
      </section>

      {/* cassandra query — keyspace, table, cql, latency */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CassandraPanel />
      </section>

      {/* ceph cluster — osds, pools, pg, replication */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CephPanel />
      </section>

      {/* cgroups — cpu, memory, blkio, hierarchy */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CgroupsPanel />
      </section>

      {/* ci pipeline — stages, jobs, artifacts, runners */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CIPipelinePanel />
      </section>

      {/* citus distributed postgres — shards, workers, routing */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CitusPanel />
      </section>

      {/* clickhouse keeper — raft, snapshots, quorum, znodes */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ClickHouseKeeperPanel />
      </section>

      {/* clickhouse migration — schema, versions, apply, rollback */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ClickhouseMigrationPanel />
      </section>

      {/* clickhouse mv — materialized views, triggers, refresh */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ClickhouseMvPanel />
      </section>

      {/* clickhouse query — mergetree, replicas, parts, mutations */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ClickHousePanel />
      </section>

      {/* clickhouse query — explain, profiling, system tables */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ClickhouseQueryPanel />
      </section>

      {/* cloudflare workers — kv, durable objects, queues, pages */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CloudflareWorkersPanel />
      </section>

      {/* cloudnative pg — clusters, backups, replication, switchover */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CloudNativePGPanel />
      </section>

      {/* cni — plugins, ipam, overlay, policy */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CniPanel />
      </section>

      {/* cockroachdb — distributed sql, replication, zones, backup */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CockroachDbPanel />
      </section>

      {/* consul — service mesh, kv, intentions, health checks */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ConsulPanel />
      </section>

      {/* containerd — images, containers, namespaces, snapshots */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <ContainerdPanel />
      </section>

      {/* cortex — query engine, ruler, compactor, store-gateway */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CortexPanel />
      </section>

      {/* coverage report — lcov, html, badge, threshold */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CoverageReportPanel />
      </section>

      {/* cpu stats — load, cores, frequency, temperature */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CpuStatsPanel />
      </section>

      {/* crossplane — providers, compositions, claims, xrds */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CrossplanePanel />
      </section>

      {/* cue — schema, validation, export, evaluate */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CuePanel />
      </section>

      {/* curl headers — request, response, timing, tls */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CurlHeadersPanel />
      </section>

      {/* curl jwt — bearer, decode, expiry, claims */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CurlJwtPanel />
      </section>

      {/* curl verbose — trace, redirect, ssl, timing */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CurlVerbosePanel />
      </section>

      {/* cyclonedx — bom, components, vulnerabilities, metadata */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <CycloneDxPanel />
      </section>

      {/* dagger — pipelines, containers, cache, secrets */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DaggerPanel />
      </section>

      {/* dbt — models, tests, sources, lineage */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DbtPanel />
      </section>

      {/* delta lake — tables, vacuum, history, merge */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DeltaLakePanel />
      </section>

      {/* dmesg — kernel, boot, drivers, errors */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DmesgPanel />
      </section>

      {/* docker build — layers, cache, args, output */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DockerBuildPanel />
      </section>

      {/* docker compose — services, networks, volumes, health */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DockerComposePanel />
      </section>

      {/* docker stats — containers, cpu, mem, net */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DockerStatsPanel />
      </section>

      {/* dragonfly dns — zones, records, acl, forwarders */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DragonFlyDnsPanel />
      </section>

      {/* dragonfly — shards, replication, keyspaces, memory */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DragonflyPanel />
      </section>

      {/* drone — pipelines, steps, triggers, secrets */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <DronePanel />
      </section>

      {/* earthly — targets, artifacts, cache, secrets */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <EarthlyPanel />
      </section>

      {/* ebpf trace — syscalls, latency, stack, probes */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <EbpfTracePanel />
      </section>

      {/* envoy — routes, clusters, listeners, filters */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <EnvoyPanel />
      </section>

      {/* envoy stats — rq, cx, health, rq_retry */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <EnvoyStatsPanel />
      </section>

      {/* env — variables, secrets, profiles, dotenv */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <EnvPanel />
      </section>

      {/* eslint output — rules, warnings, errors, fixable */}
      <section className="px-5 pb-4 mx-auto max-w-3xl">
        <EslintOutputPanel />
      </section>

      {/* etcd — keys, leases, alarms, compaction */}
      <section className="px-5 pb-6 mx-auto max-w-3xl">
        <EtcdPanel />
      </section>

      {/* Posts */}
      <section className="px-5 py-20 mx-auto max-w-3xl">
        <div
          className="overflow-hidden"
          style={{
            background: 'rgba(3,3,14,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '4px',
          }}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-dim/40 flex-1 text-center">
              construx.journal — dispatch.log
            </span>
            <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(249,115,22,0.4)' }}>
              {String(posts.length).padStart(3, '0')}
            </span>
          </div>
          {/* Shell prompt */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <span className="font-mono text-[10px]" style={{ color: 'rgba(249,115,22,0.5)' }}>construx@sys:~$</span>
              <span className="font-mono text-[10px] ml-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {activeTag
                  ? `journal --filter tag="${activeTag}" --sort=date`
                  : 'journal --all --sort=date --limit=all'}
              </span>
            </div>
            {activeTag && (
              <Link
                href="/journal"
                className="font-mono text-[9px] text-construx hover:text-orange-400 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                <X size={9} /> CLEAR
              </Link>
            )}
          </div>
          {/* Post list */}
          {posts.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-dim">
                {activeTag ? `NO DISPATCHES TAGGED: ${activeTag}` : 'SIGNAL PENDING — FIRST POST INCOMING'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: '1px', background: 'rgba(255,255,255,0.03)' }}>
              {posts.map((post) => {
                const globalIndex = allPosts.findIndex((p) => p.slug === post.slug);
                const palette = TAG_PALETTE[post.tag] ?? DEFAULT_PALETTE;
                return (
                  <Link
                    key={post.slug}
                    href={`/journal/${post.slug}`}
                    className="group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7 px-6 py-5 transition-all hover:bg-subtle"
                    style={{
                      background: 'rgba(3,3,14,0.85)',
                      borderLeft: `2px solid ${palette.rowBorder}`,
                    }}
                  >
                    <div className="flex items-center gap-4 flex-shrink-0 sm:w-44">
                      <span
                        className="font-mono text-[9px] tabular-nums w-6 text-right flex-shrink-0"
                        style={{ color: `${palette.accent}55` }}
                      >
                        #{String(allPosts.length - globalIndex).padStart(3, '0')}
                      </span>
                      <time
                        dateTime={post.date}
                        className="font-mono text-[10px] text-text-dim tabular-nums"
                      >
                        {fd(post.date)}
                      </time>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link
                          href={`/journal?tag=${encodeURIComponent(post.tag)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-[9px] font-medium px-2 py-0.5 uppercase tracking-widest transition-all"
                          style={{
                            background: palette.bg,
                            border: `1px solid ${palette.border}`,
                            color: palette.accent,
                            borderRadius: '2px',
                          }}
                        >
                          {post.tag}
                        </Link>
                        {globalIndex === 0 && (
                          <span
                            className="font-mono text-[9px] font-bold px-2 py-0.5 text-black uppercase tracking-widest bg-construx"
                            style={{ borderRadius: '2px' }}
                          >
                            NEW
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-text-dim">{post.author}</span>
                        <span className="text-text-dim text-xs opacity-50">·</span>
                        <span className="font-mono text-[10px] text-text-dim">{post.readingTime} min read</span>
                      </div>
                      <h2 className="text-sm font-bold text-text-base group-hover:text-white transition-colors mb-1 leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      className="flex-shrink-0 text-text-dim group-hover:text-text-muted group-hover:translate-x-0.5 transition-all"
                    />
                  </Link>
                );
              })}
            </div>
          )}
          {/* Status footer */}
          <div
            className="flex items-center justify-between px-5 py-1.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
          >
            <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
              {String(posts.length).padStart(3, '0')} dispatches{activeTag ? ` / tag: ${activeTag}` : ' / all'}
            </span>
            <span className="font-mono text-[8px] flex items-center gap-1.5" style={{ color: 'rgba(249,115,22,0.4)' }}>
              <span className="inline-block w-1 h-1 rounded-full bg-construx opacity-70" />
              SIGNAL: LIVE
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
