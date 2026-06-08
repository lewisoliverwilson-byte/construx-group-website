import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ManifestoNav from '@/components/manifesto/ManifestoNav';
import MethodologyDiffPanel from '@/components/MethodologyDiffPanel';
import SystemdStatusPanel from '@/components/SystemdStatusPanel';
import GitGraphPanel from '@/components/GitGraphPanel';
import WrkBenchmarkPanel from '@/components/WrkBenchmarkPanel';
import StraceSummaryPanel from '@/components/StraceSummaryPanel';
import TypeCheckPanel from '@/components/TypeCheckPanel';
import BundleAnalysisPanel from '@/components/BundleAnalysisPanel';
import LighthousePanel from '@/components/LighthousePanel';
import CoverageReportPanel from '@/components/CoverageReportPanel';
import EslintOutputPanel from '@/components/EslintOutputPanel';
import K6LoadTestPanel from '@/components/K6LoadTestPanel';
import PgExplainPanel from '@/components/PgExplainPanel';
import AnsiblePlaybookPanel from '@/components/AnsiblePlaybookPanel';
import GitBisectPanel from '@/components/GitBisectPanel';
import NixFlakePanel from '@/components/NixFlakePanel';
import PrometheusAlertPanel from '@/components/PrometheusAlertPanel';
import FalcoPanel from '@/components/FalcoPanel';
import OpensslPanel from '@/components/OpensslPanel';
import GrypePanel from '@/components/GrypePanel';
import K9sPanel from '@/components/K9sPanel';
import LinkerdPanel from '@/components/LinkerdPanel';
import TetragonPanel from '@/components/TetragonPanel';
import IstioPanel from '@/components/IstioPanel';
import ThanosPanel from '@/components/ThanosPanel';
import ArgoWorkflowsPanel from '@/components/ArgoWorkflowsPanel';
import AlertManagerPanel from '@/components/AlertManagerPanel';
import SealedSecretsPanel from '@/components/SealedSecretsPanel';
import ContainerdPanel from '@/components/ContainerdPanel';
import CloudNativePGPanel from '@/components/CloudNativePGPanel';
import GrafanaTempoPanel from '@/components/GrafanaTempoPanel';
import KubebenchPanel from '@/components/KubebenchPanel';
import OpenFgaAuditPanel from '@/components/OpenFgaAuditPanel';
import DaprPanel from '@/components/DaprPanel';
import BufPanel from '@/components/BufPanel';
import WeaviatePanel from '@/components/WeaviatePanel';
import DruidPanel from '@/components/DruidPanel';
import KedaPanel from '@/components/KedaPanel';
import OpaPanel from '@/components/OpaPanel';
import TigerBeetlePanel from '@/components/TigerBeetlePanel';
import TemporalPanel from '@/components/TemporalPanel';
import CrossplanePanel from '@/components/CrossplanePanel';
import DaggerPanel from '@/components/DaggerPanel';
import BackstagePanel from '@/components/BackstagePanel';
import OllamaPanel from '@/components/OllamaPanel';
import OpenTelemetryPanel from '@/components/OpenTelemetryPanel';
import TerraformPanel from '@/components/TerraformPanel';
import SonarQubePanel from '@/components/SonarQubePanel';
import KubeflowPipelinesPanel from '@/components/KubeflowPipelinesPanel';
import CuePanel from '@/components/CuePanel';
import QdrantPanel from '@/components/QdrantPanel';
import RiverPanel from '@/components/RiverPanel';
import PulumiPanel from '@/components/PulumiPanel';
import CosignPanel from '@/components/CosignPanel';
import TurboRepoPanel from '@/components/TurboRepoPanel';
import ActPanel from '@/components/ActPanel';
import AirflowPanel from '@/components/AirflowPanel';
import FlinkPanel from '@/components/FlinkPanel';
import AirbytePanel from '@/components/AirbytePanel';
import CiliumPanel from '@/components/CiliumPanel';
import NATSJetStreamPanel from '@/components/NATSJetStreamPanel';
import GoReleaserPanel from '@/components/GoReleaserPanel';
import AtlasPanel from '@/components/AtlasPanel';
import ArgoEventsPanel from '@/components/ArgoEventsPanel';
import AuditdPanel from '@/components/AuditdPanel';
import BoundaryPanel from '@/components/BoundaryPanel';
import CaddyPanel from '@/components/CaddyPanel';
import BpftracePanel from '@/components/BpftracePanel';
import CortexPanel from '@/components/CortexPanel';
import ClickhouseMvPanel from '@/components/ClickhouseMvPanel';
import CloudflareWorkersPanel from '@/components/CloudflareWorkersPanel';
import EbpfTracePanel from '@/components/EbpfTracePanel';
import FluxCDPanel from '@/components/FluxCDPanel';
import GoReplayPanel from '@/components/GoReplayPanel';
import HttpBenchPanel from '@/components/HttpBenchPanel';
import IostatPanel from '@/components/IostatPanel';
import BgpLookupPanel from '@/components/BgpLookupPanel';
import ClickhouseQueryPanel from '@/components/ClickhouseQueryPanel';
import CurlJwtPanel from '@/components/CurlJwtPanel';
import FioPanel from '@/components/FioPanel';
import JournalctlPanel from '@/components/JournalctlPanel';
import KeycloakPanel from '@/components/KeycloakPanel';
import KubernetesGatewayPanel from '@/components/KubernetesGatewayPanel';
import LitestreamPanel from '@/components/LitestreamPanel';
import MLflowPanel from '@/components/MLflowPanel';
import NginxAccessLogPanel from '@/components/NginxAccessLogPanel';
import OpenObservePanel from '@/components/OpenObservePanel';
import PatroniPanel from '@/components/PatroniPanel';
import PortainerPanel from '@/components/PortainerPanel';
import NetworkPingPanel from '@/components/NetworkPingPanel';
import PsAuxPanel from '@/components/PsAuxPanel';
import RedisPanel from '@/components/RedisPanel';
import TerraformCloudPanel from '@/components/TerraformCloudPanel';
import TrufflehogPanel from '@/components/TrufflehogPanel';
import SarPanel from '@/components/SarPanel';
import SensorsPanel from '@/components/SensorsPanel';
import SecurityHeadersPanel from '@/components/SecurityHeadersPanel';
import SpfDkimPanel from '@/components/SpfDkimPanel';
import ArgoCDPanel from '@/components/ArgoCDPanel';
import ArgoRolloutPanel from '@/components/ArgoRolloutPanel';
import AuthentikPanel from '@/components/AuthentikPanel';
import AwsBedrockPanel from '@/components/AwsBedrockPanel';
import AwsCliPanel from '@/components/AwsCliPanel';
import BazelPanel from '@/components/BazelPanel';
import BenthosPanel from '@/components/BenthosPanel';
import BeylaPanel from '@/components/BeylaPanel';
import BiomePanel from '@/components/BiomePanel';
import BrewListPanel from '@/components/BrewListPanel';
import BuildOutputPanel from '@/components/BuildOutputPanel';
import BunBuildPanel from '@/components/BunBuildPanel';
import CaddyAccessPanel from '@/components/CaddyAccessPanel';
import CargoPanel from '@/components/CargoPanel';
import CassandraPanel from '@/components/CassandraPanel';
import CephPanel from '@/components/CephPanel';
import CertInfoPanel from '@/components/CertInfoPanel';
import CertManagerPanel from '@/components/CertManagerPanel';
import CgroupsPanel from '@/components/CgroupsPanel';
import ChaosMeshPanel from '@/components/ChaosMeshPanel';
import CIPipelinePanel from '@/components/CIPipelinePanel';
import CitusPanel from '@/components/CitusPanel';
import ClickHouseKeeperPanel from '@/components/ClickHouseKeeperPanel';
import ClickhouseMigrationPanel from '@/components/ClickhouseMigrationPanel';
import ClickHousePanel from '@/components/ClickHousePanel';
import ClusterApiPanel from '@/components/ClusterApiPanel';
import CniPanel from '@/components/CniPanel';
import CockroachDbPanel from '@/components/CockroachDbPanel';
import ConsulPanel from '@/components/ConsulPanel';
import CpuStatsPanel from '@/components/CpuStatsPanel';
import CrontabPanel from '@/components/CrontabPanel';
import CrunchyPostgresPanel from '@/components/CrunchyPostgresPanel';
import CurlHeadersPanel from '@/components/CurlHeadersPanel';
import CurlVerbosePanel from '@/components/CurlVerbosePanel';
import CycloneDxPanel from '@/components/CycloneDxPanel';
import DbMigrationPanel from '@/components/DbMigrationPanel';
import DbtPanel from '@/components/DbtPanel';
import DebeziumPanel from '@/components/DebeziumPanel';
import DeltaLakePanel from '@/components/DeltaLakePanel';
import DigPanel from '@/components/DigPanel';
import DiskUsagePanel from '@/components/DiskUsagePanel';
import DmesgPanel from '@/components/DmesgPanel';
import DnsLookupPanel from '@/components/DnsLookupPanel';
import DockerBuildPanel from '@/components/DockerBuildPanel';
import DockerComposePanel from '@/components/DockerComposePanel';
import DockerStatsPanel from '@/components/DockerStatsPanel';
import DragonFlyDnsPanel from '@/components/DragonFlyDnsPanel';
import DragonflyPanel from '@/components/DragonflyPanel';
import DronePanel from '@/components/DronePanel';
import DuckdbPanel from '@/components/DuckdbPanel';
import EarthlyPanel from '@/components/EarthlyPanel';
import EnvoyPanel from '@/components/EnvoyPanel';
import EnvoyStatsPanel from '@/components/EnvoyStatsPanel';
import EnvPanel from '@/components/EnvPanel';
import EtcdPanel from '@/components/EtcdPanel';
import ExternalDnsPanel from '@/components/ExternalDnsPanel';
import FlaggerPanel from '@/components/FlaggerPanel';
import FlamegraphPanel from '@/components/FlamegraphPanel';
import FluentBitPanel from '@/components/FluentBitPanel';
import FreeMemPanel from '@/components/FreeMemPanel';
import GatekeeperPanel from '@/components/GatekeeperPanel';
import GatlingPanel from '@/components/GatlingPanel';
import GhActionsRunPanel from '@/components/GhActionsRunPanel';
import GhCliPanel from '@/components/GhCliPanel';
import GitBlamePanel from '@/components/GitBlamePanel';
import GitConfigPanel from '@/components/GitConfigPanel';
import GiteaPanel from '@/components/GiteaPanel';
import GitShortlogPanel from '@/components/GitShortlogPanel';
import GitSignPanel from '@/components/GitSignPanel';
import GitWorktreePanel from '@/components/GitWorktreePanel';
import GpgFingerprintPanel from '@/components/GpgFingerprintPanel';
import GrafanaAlloyPanel from '@/components/GrafanaAlloyPanel';
import GrafanaFaroPanel from '@/components/GrafanaFaroPanel';
import GrafanaOnCallPanel from '@/components/GrafanaOnCallPanel';
import GrpcCallPanel from '@/components/GrpcCallPanel';
import GrpcurlPanel from '@/components/GrpcurlPanel';
import GVisorPanel from '@/components/GVisorPanel';
import HarborPanel from '@/components/HarborPanel';
import HelmChartPanel from '@/components/HelmChartPanel';
import HtopPanel from '@/components/HtopPanel';
import HttpArchivePanel from '@/components/HttpArchivePanel';
import HubblePanel from '@/components/HubblePanel';
import HuggingFacePanel from '@/components/HuggingFacePanel';
import HyperfinePanel from '@/components/HyperfinePanel';
import IcebergPanel from '@/components/IcebergPanel';
import InfluxDbPanel from '@/components/InfluxDbPanel';
import IpAddrPanel from '@/components/IpAddrPanel';
import IpLinkPanel from '@/components/IpLinkPanel';
import JaegerTracePanel from '@/components/JaegerTracePanel';
import JfrogXrayPanel from '@/components/JfrogXrayPanel';
import JournaldPanel from '@/components/JournaldPanel';
import JournalWcPanel from '@/components/JournalWcPanel';
import K3sPanel from '@/components/K3sPanel';
import K6Panel from '@/components/K6Panel';
import K6SummaryPanel from '@/components/K6SummaryPanel';
import K8sEventsPanel from '@/components/K8sEventsPanel';
import KafkaConnectPanel from '@/components/KafkaConnectPanel';
import KafkaStreamsPanel from '@/components/KafkaStreamsPanel';
import KarpenterPanel from '@/components/KarpenterPanel';
import KindPanel from '@/components/KindPanel';

export const metadata: Metadata = {
  title: 'Manifesto',
  description:
    'The Construx Group thesis: AI-first methodology, the portfolio model, and how a small team builds what a small team normally could not.',
};

const iLink = (href: string, label: string) => (
  <Link
    key={href}
    href={href}
    className="text-construx hover:text-orange-400 underline underline-offset-2 decoration-construx/40 hover:decoration-orange-400/60 transition-colors"
  >
    {label}
  </Link>
);

const sections: { number: string; heading: string; paragraphs: ReactNode[] }[] = [
  {
    number: '01',
    heading: 'We build things that require AI to exist.',
    paragraphs: [
      <>Every venture in this portfolio was conceived because the current state of AI made it tractable for the first time. Not "AI helps us go faster." AI is the reason the thing is possible at all.</>,
      <>{iLink('/ventures/scoutr', 'Scoutr')} scans and reasons about thousands of product listings in real time — impractical to hand-code, trivial for Claude. {iLink('/ventures/the-marqet', 'The Marqet')} needed a way to organise and surface hundreds of AI configurations with genuine semantic understanding — only possible with frontier language models. {iLink('/ventures/the-hyve', 'The Hyve')} needed an AI team member that holds the full context of an entire project's history — only possible with the context windows and instruction fidelity of 2026-era AI.</>,
      <>If you could have built it in 2020 without AI, it's not a Construx venture.</>,
    ],
  },
  {
    number: '02',
    heading: 'Claude is our primary instrument. Not a shortcut.',
    paragraphs: [
      <>We use Claude and Anthropic's tools as core methodology, not as a productivity hack bolted onto a traditional build process. Claude is in the room from the first design decision. It helps define what we're building, surfaces edge cases, drafts the first versions of copy and code, and operates as a genuine collaborator through every layer of production.</>,
      <>The output is never shipped raw. But the speed at which we reach a first version worth reacting to is qualitatively different from how a traditional studio works. A two-person team operates with the output velocity of a ten-person one — not by cutting corners, but by eliminating the dead time between "I have an idea" and "I have a working thing to critique."</>,
      <>This is the model. It's not changing. {iLink('/journal/ai-first-methodology', 'Read more about the methodology')} — including {iLink('/journal/prompt-architecture-patterns', 'the prompt architecture patterns')} we've converged on and {iLink('/journal/context-window-discipline', 'how we manage context to keep output quality high')}.</>,
    ],
  },
  {
    number: '03',
    heading: 'Portfolio, not one big exit.',
    paragraphs: [
      <>The conventional startup playbook: pick one bet, go all-in, raise capital to buy time, optimise for an exit. We are not doing that.</>,
      <>The Construx model is a permanent holding structure for multiple independent ventures — each with its own market, its own brand, its own trajectory. Some will grow large. Some will stay focused. Some will get acquired. None of this requires the group to change shape.</>,
      <>This model is only viable because AI collapses the cost of building something new. When a full-featured product can be taken from concept to live in weeks rather than months, you can afford to run multiple bets simultaneously. We can. {iLink('/journal/portfolio-model', 'The full case for the portfolio model')} — and {iLink('/journal/two-person-operating-model', 'how we decide what to build next')}.</>,
    ],
  },
  {
    number: '04',
    heading: 'Small is a feature.',
    paragraphs: [
      <>We are two people. We intend to stay small on purpose.</>,
      <>Small means every decision is made by people who understand the product. It means there is no miscommunication layer between strategy and execution. It means we can turn a venture on its head in a day if the market tells us something.</>,
      <>This does not mean we build small things. It means we are deliberate about what we choose to build, and we rely on the best tools available to make two people punch absurdly above their weight. Right now, those tools are Claude, Anthropic's platform, and everything we've learned building with them.</>,
      <>We are not a boutique agency. We are not a micro-fund. We are a small team building a serious group of companies. The distinction matters.</>,
    ],
  },
  {
    number: '05',
    heading: 'Build in public. Own the record.',
    paragraphs: [
      <>We document what we build and how we build it. Not as a growth tactic — as an honest record of what this approach actually produces.</>,
      <>If something doesn't work, we write about why. If a venture pivots, the journal will show you the reasoning. If AI tooling evolves and we change our methods, you'll see that too.</>,
      <>The {iLink('/journal', 'journal')} is not marketing. It is documentation. Including {iLink('/journal/building-this-website', 'the story of this website itself')}.</>,
    ],
  },
];

export default function ManifestoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-5 animate-fade-in">
            // OUR THESIS
          </p>
          <h1 className="text-display text-text-base mb-6 leading-none animate-fade-up"
            style={{ animationDelay: '90ms' }}>
            The<br />
            <span className="text-gradient-orange">Manifesto</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-xl mx-auto animate-fade-up"
            style={{ animationDelay: '220ms' }}>
            Five principles. One model. Everything Construx builds follows from these.
          </p>
          <div
            className="inline-flex items-center gap-4 mt-8 px-4 py-2 animate-fade-up"
            style={{
              animationDelay: '340ms',
              background: 'rgba(249,115,22,0.05)',
              border: '1px solid rgba(249,115,22,0.12)',
              borderRadius: '3px',
            }}
          >
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">principles</span>
            <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="font-mono text-[9px]" style={{ color: 'rgba(249,115,22,0.7)' }}>5</span>
            <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">read</span>
            <span className="font-mono text-[9px]" style={{ color: 'rgba(249,115,22,0.7)' }}>~4 min</span>
            <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="font-mono text-[9px] text-text-dim">construx/manifesto</span>
          </div>
        </div>
      </section>

      <ManifestoNav />

      {/* Manifesto body */}
      <section className="relative px-5 py-20 mx-auto max-w-3xl">
        <div className="flex flex-col gap-6">
          {sections.map((s, i) => (
            <div
              key={s.number}
              id={s.number}
              className="scroll-mt-24 overflow-hidden"
              style={{
                background: 'rgba(3,3,14,0.88)',
                border: '1px solid rgba(249,115,22,0.13)',
                borderRadius: '4px',
                boxShadow: '0 0 40px rgba(249,115,22,0.04)',
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-3 px-4 py-2.5 select-none"
                style={{ borderBottom: '1px solid rgba(249,115,22,0.1)', background: 'rgba(249,115,22,0.03)' }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <a
                  href={`#${s.number}`}
                  className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center transition-colors hover:opacity-80"
                  style={{ color: 'rgba(249,115,22,0.4)' }}
                  aria-label={`Section ${s.number}`}
                >
                  construx.manifesto — principle.{s.number}
                </a>
                <span
                  className="font-mono text-[9px] font-bold tabular-nums"
                  style={{ color: 'rgba(249,115,22,0.55)' }}
                >
                  {s.number}/{sections.length}
                </span>
              </div>

              {/* Shell prompt line */}
              <div
                className="flex items-center gap-2 px-5 py-2 font-mono text-[10px]"
                style={{ borderBottom: '1px solid rgba(249,115,22,0.07)', background: 'rgba(0,0,6,0.35)' }}
              >
                <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@sys</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
                <span style={{ color: 'rgba(240,239,255,0.28)' }}>
                  cat /etc/construx/manifesto/principle-{s.number}.md
                </span>
              </div>

              {/* Content */}
              <div className="px-8 py-8">
                <h2 className="text-heading-xl text-text-base mb-5 leading-tight">
                  {s.heading}
                </h2>
                {s.paragraphs.map((para, pi) => (
                  <p
                    key={pi}
                    className="text-text-muted leading-relaxed text-base mb-4 last:mb-0"
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Status footer */}
              <div
                className="flex items-center justify-between px-4 py-1.5"
                style={{ borderTop: '1px solid rgba(249,115,22,0.07)', background: 'rgba(0,0,0,0.25)' }}
              >
                <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.25)' }}>
                  principle.{s.number}
                </span>
                {i < sections.length - 1 ? (
                  <a
                    href={`#${sections[i + 1].number}`}
                    className="font-mono text-[8px] uppercase tracking-widest transition-colors hover:opacity-80"
                    style={{ color: 'rgba(249,115,22,0.3)' }}
                  >
                    next: {sections[i + 1].number} ↓
                  </a>
                ) : (
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.35)' }}>
                    ● EOF
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Methodology diff panel */}
        <div className="mt-4">
          <MethodologyDiffPanel />
        </div>

        {/* Systemd service status */}
        <div className="mt-4">
          <SystemdStatusPanel />
        </div>

        {/* Git commit history */}
        <div className="mt-4">
          <GitGraphPanel />
        </div>

        {/* Load benchmark */}
        <div className="mt-4">
          <WrkBenchmarkPanel />
        </div>

        {/* Syscall summary */}
        <div className="mt-4">
          <StraceSummaryPanel />
        </div>

        {/* Type check */}
        <div className="mt-4">
          <TypeCheckPanel />
        </div>

        {/* Bundle analysis */}
        <div className="mt-4">
          <BundleAnalysisPanel />
        </div>

        {/* Lighthouse audit */}
        <div className="mt-4 pb-4">
          <LighthousePanel />
        </div>

        {/* Coverage report */}
        <div className="mt-4 pb-4">
          <CoverageReportPanel />
        </div>

        {/* ESLint output */}
        <div className="mt-4 pb-4">
          <EslintOutputPanel />
        </div>

        {/* k6 load test */}
        <div className="mt-4 pb-4">
          <K6LoadTestPanel />
        </div>

        {/* PostgreSQL EXPLAIN ANALYZE */}
        <div className="mt-4 pb-4">
          <PgExplainPanel />
        </div>

        {/* Ansible playbook run */}
        <div className="mt-4 pb-4">
          <AnsiblePlaybookPanel />
        </div>

        {/* git bisect regression hunt */}
        <div className="mt-4 pb-4">
          <GitBisectPanel />
        </div>

        {/* Nix flake reproducible environment */}
        <div className="mt-4 pb-4">
          <NixFlakePanel />
        </div>

        {/* Prometheus AlertManager firing alerts */}
        <div className="mt-4 pb-4">
          <PrometheusAlertPanel />
        </div>

        {/* Falco runtime security */}
        <div className="mt-4 pb-4">
          <FalcoPanel />
        </div>

        {/* openssl certificate inspection and key generation */}
        <div className="mt-4 pb-4">
          <OpensslPanel />
        </div>

        {/* grype vulnerability scanner — SBOM-aware CVE detection */}
        <div className="mt-4 pb-4">
          <GrypePanel />
        </div>

        {/* k9s kubernetes cluster terminal UI */}
        <div className="mt-4 pb-4">
          <K9sPanel />
        </div>

        {/* linkerd service mesh — mTLS, routes, retry budget */}
        <div className="mt-4 pb-4">
          <LinkerdPanel />
        </div>

        {/* tetragon ebpf runtime security — tracingpolicy, sigkill, process lifecycle */}
        <div className="mt-4 pb-4">
          <TetragonPanel />
        </div>

        {/* istio service mesh — envoy, mtls, virtualservice, authorizationpolicy */}
        <div className="mt-4 pb-4">
          <IstioPanel />
        </div>

        {/* thanos prometheus long-term storage — s3, global query, deduplication, compaction */}
        <div className="mt-4 pb-4">
          <ThanosPanel />
        </div>

        {/* argo workflows dag pipelines — ml training, artifacts, parallel steps */}
        <div className="mt-4 pb-4">
          <ArgoWorkflowsPanel />
        </div>

        {/* alertmanager routing, silences, inhibitions — prometheus alerting */}
        <div className="mt-4 pb-4">
          <AlertManagerPanel />
        </div>

        {/* sealed secrets gitops-safe encryption — kubeseal, rsa-4096, strict scope */}
        <div className="mt-4 pb-6">
          <SealedSecretsPanel />
        </div>

        {/* containerd cri runtime — images, snapshotter, runc v2 shim, tasks */}
        <div className="mt-4 pb-6">
          <ContainerdPanel />
        </div>

        {/* cloudnative-pg postgres operator — ha clusters, streaming replication, barman backup */}
        <div className="mt-4 pb-6">
          <CloudNativePGPanel />
        </div>

        {/* grafana tempo distributed tracing — spans, s3 backend, trace search */}
        <div className="mt-4 pb-6">
          <GrafanaTempoPanel />
        </div>

        {/* kube-bench cis kubernetes benchmark — control plane, nodes, policies */}
        <div className="mt-4 pb-6">
          <KubebenchPanel />
        </div>

        {/* openfga relationship-based authorization — tuples, checks, zanzibar model */}
        <div className="mt-4 pb-6">
          <OpenFgaAuditPanel />
        </div>

        {/* dapr distributed app runtime — building blocks, service invocation, sidecars */}
        <div className="mt-4 pb-6">
          <DaprPanel />
        </div>

        {/* buf protobuf schema registry — modules, lint, breaking changes */}
        <div className="mt-4 pb-6">
          <BufPanel />
        </div>

        {/* weaviate ml-native vector db — collections, hybrid search, nearText queries */}
        <div className="mt-4 pb-4">
          <WeaviatePanel />
        </div>

        {/* apache druid real-time olap — datasources, kafka ingest, native sql */}
        <div className="mt-4 pb-4">
          <DruidPanel />
        </div>

        {/* keda k8s event-driven autoscaling — scaledobjects, triggers, replicas */}
        <div className="mt-4 pb-4">
          <KedaPanel />
        </div>

        {/* opa open policy agent — rego, admission, api authz, decisions */}
        <div className="mt-4 pb-4">
          <OpaPanel />
        </div>

        {/* tigerbeetle financial ledger — accounts, transfers, two-phase commit */}
        <div className="mt-4 pb-4">
          <TigerBeetlePanel />
        </div>

        {/* temporal workflow orchestration — workflows, activities, namespaces */}
        <div className="mt-4 pb-4">
          <TemporalPanel />
        </div>

        {/* crossplane infrastructure-as-code — claims, compositions, providers */}
        <div className="mt-4 pb-4">
          <CrossplanePanel />
        </div>

        {/* dagger programmable ci — pipelines, cache, services */}
        <div className="mt-4 pb-4">
          <DaggerPanel />
        </div>

        {/* backstage developer portal — catalog, techdocs, plugins */}
        <div className="mt-4 pb-4">
          <BackstagePanel />
        </div>

        {/* ollama local llm — models, generations, embeddings */}
        <div className="mt-4 pb-4">
          <OllamaPanel />
        </div>

        {/* opentelemetry observability — traces, metrics, logs */}
        <div className="mt-4 pb-4">
          <OpenTelemetryPanel />
        </div>

        {/* terraform infrastructure as code — workspaces, plans, state */}
        <div className="mt-4 pb-4">
          <TerraformPanel />
        </div>

        {/* sonarqube code quality — projects, coverage, issues */}
        <div className="mt-4 pb-4">
          <SonarQubePanel />
        </div>

        {/* kubeflow pipelines mlops — pipelines, runs, experiments */}
        <div className="mt-4 pb-4">
          <KubeflowPipelinesPanel />
        </div>

        {/* cue data validation — schemas, constraints, code gen */}
        <div className="mt-4 pb-4">
          <CuePanel />
        </div>

        {/* qdrant vector search — collections, points, similarity */}
        <div className="mt-4 pb-4">
          <QdrantPanel />
        </div>

        {/* river data pipeline — jobs, stages, throughput */}
        <div className="mt-4 pb-4">
          <RiverPanel />
        </div>

        {/* pulumi infrastructure as code — stacks, resources, deployments */}
        <div className="mt-4 pb-4">
          <PulumiPanel />
        </div>

        {/* cosign container image signing — signatures, attestations, keyless */}
        <div className="mt-4 pb-4">
          <CosignPanel />
        </div>

        {/* turborepo monorepo build system — tasks, cache, pipelines */}
        <div className="mt-4 pb-4">
          <TurboRepoPanel />
        </div>

        {/* act github actions locally — jobs, steps, runners */}
        <div className="mt-4 pb-4">
          <ActPanel />
        </div>

        {/* airflow dag orchestration — celery, sensors, xcom, dynamic tasks */}
        <div className="mt-4 pb-4">
          <AirflowPanel />
        </div>

        {/* flink stateful stream processing — exactly-once, windows, checkpoints */}
        <div className="mt-4 pb-4">
          <FlinkPanel />
        </div>

        {/* airbyte open-source elt — connectors, syncs, data movement */}
        <div className="mt-4 pb-4">
          <AirbytePanel />
        </div>

        {/* cilium ebpf networking — endpoints, policy, hubble flows */}
        <div className="mt-4 pb-4">
          <CiliumPanel />
        </div>

        {/* nats jetstream — streams, consumers, messages, acks */}
        <div className="mt-4 pb-4">
          <NATSJetStreamPanel />
        </div>

        {/* goreleaser — release automation, binaries, docker, changelog */}
        <div className="mt-4 pb-4">
          <GoReleaserPanel />
        </div>

        {/* atlas database schema management — migrations, drift, ci */}
        <div className="mt-4 pb-4">
          <AtlasPanel />
        </div>

        {/* argo events — event-driven automation, sensors, triggers */}
        <div className="mt-4 pb-4">
          <ArgoEventsPanel />
        </div>

        {/* auditd — linux audit daemon, syscalls, rules, events */}
        <div className="mt-4 pb-4">
          <AuditdPanel />
        </div>

        {/* boundary — zero-trust access, targets, sessions, credentials */}
        <div className="mt-4 pb-4">
          <BoundaryPanel />
        </div>

        {/* caddy — reverse proxy, https, routes, upstreams */}
        <div className="mt-4 pb-4">
          <CaddyPanel />
        </div>

        {/* bpftrace — kernel tracing, probes, maps, aggregations */}
        <div className="mt-4 pb-4">
          <BpftracePanel />
        </div>

        {/* cortex — multi-tenant prometheus, ruler, compactor */}
        <div className="mt-4 pb-4">
          <CortexPanel />
        </div>

        {/* clickhouse mv — materialized views, targets, engines */}
        <div className="mt-4 pb-4">
          <ClickhouseMvPanel />
        </div>

        {/* cloudflare workers — routes, bindings, kv, durable objects */}
        <div className="mt-4 pb-4">
          <CloudflareWorkersPanel />
        </div>

        {/* ebpf trace — syscalls, latency histogram, stack frames */}
        <div className="mt-4 pb-4">
          <EbpfTracePanel />
        </div>

        {/* flux cd — gitops, sources, kustomizations, reconcile */}
        <div className="mt-4 pb-4">
          <FluxCDPanel />
        </div>

        {/* goreplay — http traffic replay, middleware, rate limit */}
        <div className="mt-4 pb-4">
          <GoReplayPanel />
        </div>

        {/* http bench — rps, latency, connections, throughput */}
        <div className="mt-4 pb-4">
          <HttpBenchPanel />
        </div>

        {/* iostat — disk io, await, util, read/write rates */}
        <div className="mt-4 pb-4">
          <IostatPanel />
        </div>

        {/* bgp lookup — asn, prefixes, peers, origin */}
        <div className="mt-4 pb-4">
          <BgpLookupPanel />
        </div>

        {/* clickhouse query — sql, rows, duration, bytes */}
        <div className="mt-4 pb-4">
          <ClickhouseQueryPanel />
        </div>

        {/* curl jwt — token, claims, expiry, signature */}
        <div className="mt-4 pb-4">
          <CurlJwtPanel />
        </div>

        {/* fio — iops, bw, lat, sequential, random */}
        <div className="mt-4 pb-4">
          <FioPanel />
        </div>

        {/* journalctl — units, priorities, timestamps, fields */}
        <div className="mt-4 pb-4">
          <JournalctlPanel />
        </div>

        {/* keycloak — realms, clients, users, tokens */}
        <div className="mt-4 pb-4">
          <KeycloakPanel />
        </div>

        {/* kubernetes gateway — routes, listeners, backends, policies */}
        <div className="mt-4 pb-4">
          <KubernetesGatewayPanel />
        </div>

        {/* litestream — replicas, lag, snapshots, restore */}
        <div className="mt-4 pb-4">
          <LitestreamPanel />
        </div>

        {/* mlflow — experiments, runs, metrics, artifacts */}
        <div className="mt-4 pb-4">
          <MLflowPanel />
        </div>

        {/* nginx access log — requests, status, bytes, latency */}
        <div className="mt-4 pb-4">
          <NginxAccessLogPanel />
        </div>

        {/* openobserve — streams, alerts, dashboards, ingestion */}
        <div className="mt-4 pb-4">
          <OpenObservePanel />
        </div>

        {/* patroni — leader, replicas, lag, failover */}
        <div className="mt-4 pb-4">
          <PatroniPanel />
        </div>

        {/* portainer — containers, stacks, volumes, networks */}
        <div className="mt-4 pb-4">
          <PortainerPanel />
        </div>

        {/* network ping — hosts, rtt, loss, jitter */}
        <div className="mt-4 pb-4">
          <NetworkPingPanel />
        </div>

        {/* ps aux — processes, cpu, mem, state, command */}
        <div className="mt-4 pb-4">
          <PsAuxPanel />
        </div>

        {/* redis — cluster, streams, commands, memory */}
        <div className="mt-4 pb-4">
          <RedisPanel />
        </div>

        {/* terraform cloud — remote runs, workspaces, drift, state */}
        <div className="mt-4 pb-4">
          <TerraformCloudPanel />
        </div>

        {/* trufflehog — secret scanning, verified credentials, git history */}
        <div className="mt-4 pb-4">
          <TrufflehogPanel />
        </div>

        {/* sar — cpu, mem, io activity over time, historical */}
        <div className="mt-4 pb-4">
          <SarPanel />
        </div>

        {/* sensors — hardware temp, fan, voltage, thermal zones */}
        <div className="mt-4 pb-4">
          <SensorsPanel />
        </div>

        {/* security headers — hsts, csp, x-frame, referrer, permissions */}
        <div className="mt-4 pb-4">
          <SecurityHeadersPanel />
        </div>

        {/* spf dkim — email auth, dmarc, dns records, alignment */}
        <div className="mt-4 pb-4">
          <SpfDkimPanel />
        </div>

        {/* argo cd — gitops, sync, apps, rollbacks */}
        <div className="mt-4 pb-4">
          <ArgoCDPanel />
        </div>

        {/* argo rollout — progressive delivery, canary, bluegreen, analysis */}
        <div className="mt-4 pb-4">
          <ArgoRolloutPanel />
        </div>

        {/* authentik — identity provider, sso, oauth2, audit */}
        <div className="mt-4 pb-4">
          <AuthentikPanel />
        </div>

        {/* aws bedrock — foundation models, inference, agents */}
        <div className="mt-4 pb-4">
          <AwsBedrockPanel />
        </div>

        {/* aws cli — s3, ec2, iam, lambda commands */}
        <div className="mt-4 pb-4">
          <AwsCliPanel />
        </div>

        {/* bazel hermetic build — remote cache, targets, action cache stats */}
        <div className="mt-4 pb-4">
          <BazelPanel />
        </div>

        {/* benthos stream processor — pipelines, bloblang, fanout */}
        <div className="mt-4 pb-4">
          <BenthosPanel />
        </div>

        {/* beyla ebpf auto-instrumentation — spans, latency, red metrics */}
        <div className="mt-4 pb-4">
          <BeylaPanel />
        </div>

        {/* biome js toolchain — lint, format, check, ci */}
        <div className="mt-4 pb-4">
          <BiomePanel />
        </div>

        {/* brew list — installed formulae, casks, versions */}
        <div className="mt-4 pb-4">
          <BrewListPanel />
        </div>

        {/* build output — next.js compilation, chunks, sizes */}
        <div className="mt-4 pb-4">
          <BuildOutputPanel />
        </div>

        {/* bun build — bundler, transpile, minify, treeshake */}
        <div className="mt-4 pb-4">
          <BunBuildPanel />
        </div>

        {/* caddy access log — requests, status, latency, bytes */}
        <div className="mt-4 pb-4">
          <CaddyAccessPanel />
        </div>

        {/* cargo release build — compile, link, test, artifact */}
        <div className="mt-4 pb-4">
          <CargoPanel />
        </div>

        {/* cassandra distributed db — ring, keyspaces, replication factor */}
        <div className="mt-4 pb-4">
          <CassandraPanel />
        </div>

        {/* ceph rados distributed storage — rbd, cephfs, rgw, crush */}
        <div className="mt-4 pb-4">
          <CephPanel />
        </div>

        {/* tls certificate info — san, validity, issuer, chain */}
        <div className="mt-4 pb-4">
          <CertInfoPanel />
        </div>

        {/* cert manager — issuers, certificates, renewals, status */}
        <div className="mt-4 pb-4">
          <CertManagerPanel />
        </div>

        {/* cgroups — cpu, memory, blkio, hierarchy */}
        <div className="mt-4 pb-4">
          <CgroupsPanel />
        </div>

        {/* chaos mesh — faults, experiments, schedules, pods */}
        <div className="mt-4 pb-4">
          <ChaosMeshPanel />
        </div>

        {/* ci pipeline — stages, jobs, artifacts, runners */}
        <div className="mt-4 pb-4">
          <CIPipelinePanel />
        </div>

        {/* citus distributed postgres — shards, workers, routing */}
        <div className="mt-4 pb-4">
          <CitusPanel />
        </div>

        {/* clickhouse keeper — raft, snapshots, quorum, znodes */}
        <div className="mt-4 pb-4">
          <ClickHouseKeeperPanel />
        </div>

        {/* clickhouse migration — schema, versions, apply, rollback */}
        <div className="mt-4 pb-4">
          <ClickhouseMigrationPanel />
        </div>

        {/* clickhouse query — mergetree, replicas, parts, mutations */}
        <div className="mt-4 pb-4">
          <ClickHousePanel />
        </div>

        {/* cluster api — providers, machines, controlplane, kubeconfig */}
        <div className="mt-4 pb-4">
          <ClusterApiPanel />
        </div>

        {/* cni — plugins, ipam, overlay, policy */}
        <div className="mt-4 pb-4">
          <CniPanel />
        </div>

        {/* cockroachdb — distributed sql, regions, ranges, raft */}
        <div className="mt-4 pb-4">
          <CockroachDbPanel />
        </div>

        {/* consul — service mesh, kv, intentions, health */}
        <div className="mt-4 pb-4">
          <ConsulPanel />
        </div>

        {/* cpu stats — usage, load, cores, steal, iowait */}
        <div className="mt-4 pb-4">
          <CpuStatsPanel />
        </div>

        {/* crontab — schedule, expression, jobs, last run */}
        <div className="mt-4 pb-4">
          <CrontabPanel />
        </div>

        {/* crunchy postgres — ha, backups, pgbouncer, pgbadger */}
        <div className="mt-4 pb-4">
          <CrunchyPostgresPanel />
        </div>

        {/* curl headers — request, response, timing, tls */}
        <div className="mt-4 pb-4">
          <CurlHeadersPanel />
        </div>

        {/* curl verbose — trace, redirect, ssl, timing */}
        <div className="mt-4 pb-4">
          <CurlVerbosePanel />
        </div>

        {/* cyclonedx — bom, components, vulnerabilities, metadata */}
        <div className="mt-4 pb-4">
          <CycloneDxPanel />
        </div>

        {/* db migration — flyway, liquibase, versions, checksums */}
        <div className="mt-4 pb-4">
          <DbMigrationPanel />
        </div>

        {/* dbt — models, tests, sources, lineage */}
        <div className="mt-4 pb-4">
          <DbtPanel />
        </div>

        {/* debezium — cdc, connectors, transforms, offsets */}
        <div className="mt-4 pb-4">
          <DebeziumPanel />
        </div>

        {/* delta lake — acid, time travel, schema evolution, partitions */}
        <div className="mt-4 pb-4">
          <DeltaLakePanel />
        </div>

        {/* dig — dns query, records, trace, reverse */}
        <div className="mt-4 pb-4">
          <DigPanel />
        </div>

        {/* disk usage — df, partitions, inodes, mounts */}
        <div className="mt-4 pb-4">
          <DiskUsagePanel />
        </div>

        {/* dmesg — kernel, boot, drivers, errors */}
        <div className="mt-4 pb-4">
          <DmesgPanel />
        </div>

        {/* dns lookup — a, aaaa, mx, txt records */}
        <div className="mt-4 pb-4">
          <DnsLookupPanel />
        </div>

        {/* docker build — layers, cache, multistage, args */}
        <div className="mt-4 pb-4">
          <DockerBuildPanel />
        </div>

        {/* docker compose — services, networks, volumes, env */}
        <div className="mt-4 pb-4">
          <DockerComposePanel />
        </div>

        {/* docker stats — containers, cpu, mem, net */}
        <div className="mt-4 pb-4">
          <DockerStatsPanel />
        </div>

        {/* dragonfly dns — zones, records, acl, forwarders */}
        <div className="mt-4 pb-4">
          <DragonFlyDnsPanel />
        </div>

        {/* dragonfly — shards, replication, keyspaces, memory */}
        <div className="mt-4 pb-4">
          <DragonflyPanel />
        </div>

        {/* drone — pipelines, steps, triggers, secrets */}
        <div className="mt-4 pb-4">
          <DronePanel />
        </div>

        {/* duckdb — queries, parquet, extensions, attach */}
        <div className="mt-4 pb-4">
          <DuckdbPanel />
        </div>

        {/* earthly — targets, artifacts, cache, secrets */}
        <div className="mt-4 pb-4">
          <EarthlyPanel />
        </div>

        {/* envoy — routes, clusters, listeners, filters */}
        <div className="mt-4 pb-4">
          <EnvoyPanel />
        </div>

        {/* envoy stats — clusters, upstreams, rq, cx */}
        <div className="mt-4 pb-4">
          <EnvoyStatsPanel />
        </div>

        {/* env — variables, secrets, profiles, dotenv */}
        <div className="mt-4 pb-4">
          <EnvPanel />
        </div>

        {/* etcd — keys, leases, members, watches */}
        <div className="mt-4 pb-4">
          <EtcdPanel />
        </div>

        {/* external dns — records, providers, sources, sync */}
        <div className="mt-4 pb-4">
          <ExternalDnsPanel />
        </div>

        {/* flagger — canary, rollout, analysis, webhooks */}
        <div className="mt-4 pb-4">
          <FlaggerPanel />
        </div>

        {/* flamegraph — cpu, memory, wall, flamegraph */}
        <div className="mt-4 pb-4">
          <FlamegraphPanel />
        </div>

        {/* fluentbit — pipelines, inputs, outputs, filters */}
        <div className="mt-4 pb-4">
          <FluentBitPanel />
        </div>

        {/* freemem — rss, heap, external, arraybuffers */}
        <div className="mt-4 pb-4">
          <FreeMemPanel />
        </div>

        {/* gatekeeper — constraints, violations, audit, policy */}
        <div className="mt-4 pb-4">
          <GatekeeperPanel />
        </div>

        {/* gatling — scenarios, users, rps, latency */}
        <div className="mt-4 pb-4">
          <GatlingPanel />
        </div>

        {/* gh actions run — jobs, steps, status, duration */}
        <div className="mt-4 pb-4">
          <GhActionsRunPanel />
        </div>

        {/* gh cli — repos, prs, issues, auth */}
        <div className="mt-4 pb-4">
          <GhCliPanel />
        </div>

        {/* git blame — authors, commits, lines, dates */}
        <div className="mt-4 pb-4">
          <GitBlamePanel />
        </div>

        {/* git config — globals, locals, remotes, aliases */}
        <div className="mt-4 pb-4">
          <GitConfigPanel />
        </div>

        {/* gitea — repos, issues, prs, org */}
        <div className="mt-4 pb-4">
          <GiteaPanel />
        </div>

        {/* git shortlog — authors, commits, files, insertions */}
        <div className="mt-4 pb-4">
          <GitShortlogPanel />
        </div>

        {/* git sign — signers, keys, status, fingerprints */}
        <div className="mt-4 pb-4">
          <GitSignPanel />
        </div>

        {/* git worktree — branches, linked, prune, list */}
        <div className="mt-4 pb-4">
          <GitWorktreePanel />
        </div>

        {/* gpg fingerprint — keys, fingerprints, trust, expiry */}
        <div className="mt-4 pb-4">
          <GpgFingerprintPanel />
        </div>

        {/* grafana alloy — pipelines, components, otel, logs */}
        <div className="mt-4 pb-4">
          <GrafanaAlloyPanel />
        </div>

        {/* grafana faro — errors, sessions, vitals, spans */}
        <div className="mt-4 pb-4">
          <GrafanaFaroPanel />
        </div>

        {/* grafana oncall — rotations, alerts, escalations, silences */}
        <div className="mt-4 pb-4">
          <GrafanaOnCallPanel />
        </div>

        {/* grpc call — method, metadata, request, response */}
        <div className="mt-4 pb-4">
          <GrpcCallPanel />
        </div>

        {/* grpcurl — services, methods, describe, invoke */}
        <div className="mt-4 pb-4">
          <GrpcurlPanel />
        </div>

        {/* gvisor — sandboxing, syscalls, containers, isolation */}
        <div className="mt-4 pb-4">
          <GVisorPanel />
        </div>

        {/* harbor — registries, repos, scans, policies */}
        <div className="mt-4 pb-4">
          <HarborPanel />
        </div>

        {/* helm chart — releases, values, hooks, manifests */}
        <div className="mt-4 pb-4">
          <HelmChartPanel />
        </div>

        {/* htop — processes, cpu, memory, load */}
        <div className="mt-4 pb-4">
          <HtopPanel />
        </div>

        {/* http archive — requests, timings, waterfall, headers */}
        <div className="mt-4 pb-4">
          <HttpArchivePanel />
        </div>

        {/* hubble — flows, services, endpoints, policies */}
        <div className="mt-4 pb-4">
          <HubblePanel />
        </div>

        {/* hugging face — models, datasets, spaces, inference */}
        <div className="mt-4 pb-4">
          <HuggingFacePanel />
        </div>

        {/* hyperfine — benchmarks, commands, runs, statistics */}
        <div className="mt-4 pb-4">
          <HyperfinePanel />
        </div>

        {/* iceberg — tables, snapshots, partitions, manifests */}
        <div className="mt-4 pb-4">
          <IcebergPanel />
        </div>

        {/* influxdb — measurements, tags, fields, retention */}
        <div className="mt-4 pb-4">
          <InfluxDbPanel />
        </div>

        {/* ip addr — addresses, interfaces, prefixes, scope */}
        <div className="mt-4 pb-4">
          <IpAddrPanel />
        </div>

        {/* ip link — interfaces, states, addresses, routes */}
        <div className="mt-4 pb-4">
          <IpLinkPanel />
        </div>

        {/* jaeger trace — traces, spans, services, durations */}
        <div className="mt-4 pb-4">
          <JaegerTracePanel />
        </div>

        {/* jfrog xray — vulnerabilities, licenses, components, policies */}
        <div className="mt-4 pb-4">
          <JfrogXrayPanel />
        </div>

        {/* journald — units, messages, priorities, fields */}
        <div className="mt-4 pb-4">
          <JournaldPanel />
        </div>

        {/* journal wc — words, lines, bytes, messages */}
        <div className="mt-4 pb-4">
          <JournalWcPanel />
        </div>

        {/* k3s — clusters, nodes, pods, services */}
        <div className="mt-4 pb-4">
          <K3sPanel />
        </div>

        {/* k6 — scenarios, checks, thresholds, vus */}
        <div className="mt-4 pb-4">
          <K6Panel />
        </div>

        {/* k6 summary — passes, fails, rate, percentiles */}
        <div className="mt-4 pb-4">
          <K6SummaryPanel />
        </div>

        {/* k8s events — reasons, objects, counts, timestamps */}
        <div className="mt-4 pb-4">
          <K8sEventsPanel />
        </div>

        {/* kafka connect — connectors, tasks, status, plugins */}
        <div className="mt-4 pb-4">
          <KafkaConnectPanel />
        </div>

        {/* kafka streams — topologies, tasks, threads, stores */}
        <div className="mt-4 pb-4">
          <KafkaStreamsPanel />
        </div>

        {/* karpenter — nodes, provisioners, machines, capacity */}
        <div className="mt-4 pb-4">
          <KarpenterPanel />
        </div>

        {/* kind — clusters, nodes, images, configs */}
        <div className="mt-4 pb-6">
          <KindPanel />
        </div>

        {/* Sign-off */}
        <div
          className="mt-4 overflow-hidden"
          style={{
            background: 'rgba(5,5,18,0.8)',
            border: '1px solid rgba(249,115,22,0.18)',
            borderRadius: '3px',
          }}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 border-b select-none"
            style={{
              borderColor: 'rgba(249,115,22,0.12)',
              background: 'rgba(249,115,22,0.03)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim flex-1 text-center">
              construx.next_step
            </span>
          </div>

          {/* Shell prompt */}
          <div
            className="px-4 py-1.5 select-none"
            style={{ borderBottom: '1px solid rgba(249,115,22,0.07)', background: 'rgba(0,0,6,0.35)' }}
          >
            <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
              construx@sys:~$
            </span>
            <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.25)' }}>
              construx engage --init
            </span>
          </div>

          <div className="px-8 py-8">
            <p className="text-text-muted leading-relaxed mb-4">
              If this resonates — as a user, a collaborator, or someone who wants to build with us —
              the next step is the same.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-wider"
                style={{ borderRadius: '3px' }}
              >
                Get in touch <ArrowRight size={14} />
              </Link>
              <Link
                href="/founders"
                className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all uppercase tracking-wider"
                style={{ borderRadius: '3px' }}
              >
                Meet the founders
              </Link>
            </div>
          </div>

          {/* Status bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5 border-t"
            style={{
              borderColor: 'rgba(249,115,22,0.1)',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-widest"
                style={{ color: 'rgba(40,200,64,0.7)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#28C840' }}
                />
                SYS:ONLINE
              </span>
            </div>
            <span className="font-mono text-[8px] text-text-dim">construx.io/manifesto</span>
          </div>
        </div>
      </section>
    </div>
  );
}
