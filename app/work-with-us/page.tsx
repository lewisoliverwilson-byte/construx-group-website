import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Zap, Layers, Code2, Rocket, BookOpen, ExternalLink } from 'lucide-react';
import CIPipelinePanel from '@/components/CIPipelinePanel';
import DockerStatsPanel from '@/components/DockerStatsPanel';
import TerraformPlanPanel from '@/components/TerraformPlanPanel';
import KubectlPodsPanel from '@/components/KubectlPodsPanel';
import NmapScanPanel from '@/components/NmapScanPanel';
import K8sEventsPanel from '@/components/K8sEventsPanel';
import HelmChartPanel from '@/components/HelmChartPanel';
import PrometheusMetricsPanel from '@/components/PrometheusMetricsPanel';
import KubectlLogsPanel from '@/components/KubectlLogsPanel';
import ArgoRolloutPanel from '@/components/ArgoRolloutPanel';
import VaultSecretsPanel from '@/components/VaultSecretsPanel';
import FluxCdPanel from '@/components/FluxCdPanel';
import TailnetStatusPanel from '@/components/TailnetStatusPanel';
import GhActionsRunPanel from '@/components/GhActionsRunPanel';
import PackerBuildPanel from '@/components/PackerBuildPanel';
import EnvoyStatsPanel from '@/components/EnvoyStatsPanel';
import TrivyVulnPanel from '@/components/TrivyVulnPanel';
import VeleroPanel from '@/components/VeleroPanel';
import PulumiPanel from '@/components/PulumiPanel';
import RclonePanel from '@/components/RclonePanel';
import ValsPanel from '@/components/ValsPanel';
import VictoriaMetricsPanel from '@/components/VictoriaMetricsPanel';
import MaterializePanel from '@/components/MaterializePanel';
import VitessPanel from '@/components/VitessPanel';
import MinIOPanel from '@/components/MinIOPanel';
import NATSJetStreamPanel from '@/components/NATSJetStreamPanel';
import RenovatePanel from '@/components/RenovatePanel';
import StrimziPanel from '@/components/StrimziPanel';
import VclusterPanel from '@/components/VclusterPanel';
import ZitadelPanel from '@/components/ZitadelPanel';
import RekorPanel from '@/components/RekorPanel';
import HarborPanel from '@/components/HarborPanel';
import RiverPanel from '@/components/RiverPanel';
import EarthlyPanel from '@/components/EarthlyPanel';
import TypesensePanel from '@/components/TypesensePanel';
import PrefectPanel from '@/components/PrefectPanel';
import SpiceDbPanel from '@/components/SpiceDbPanel';
import StepSecurityPanel from '@/components/StepSecurityPanel';
import GrypePanel from '@/components/GrypePanel';
import CycloneDxPanel from '@/components/CycloneDxPanel';
import SyftPanel from '@/components/SyftPanel';
import ScorecardPanel from '@/components/ScorecardPanel';
import SpirePanel from '@/components/SpirePanel';
import GiteaPanel from '@/components/GiteaPanel';
import GrafanaOnCallPanel from '@/components/GrafanaOnCallPanel';
import GatekeeperPanel from '@/components/GatekeeperPanel';
import PulsarPanel from '@/components/PulsarPanel';
import NomadPanel from '@/components/NomadPanel';
import ClickHouseKeeperPanel from '@/components/ClickHouseKeeperPanel';
import PineconePanel from '@/components/PineconePanel';
import WeaviatePanel from '@/components/WeaviatePanel';
import TigerBeetlePanel from '@/components/TigerBeetlePanel';
import ZarfPanel from '@/components/ZarfPanel';
import KindPanel from '@/components/KindPanel';
import BunBuildPanel from '@/components/BunBuildPanel';
import TypeCheckPanel from '@/components/TypeCheckPanel';
import CiliumPanel from '@/components/CiliumPanel';
import DaprPanel from '@/components/DaprPanel';
import AirflowPanel from '@/components/AirflowPanel';
import FlinkPanel from '@/components/FlinkPanel';
import AirbytePanel from '@/components/AirbytePanel';
import SpiffePanel from '@/components/SpiffePanel';
import GoReleaserPanel from '@/components/GoReleaserPanel';
import AuthentikPanel from '@/components/AuthentikPanel';
import AwsBedrockPanel from '@/components/AwsBedrockPanel';
import CephPanel from '@/components/CephPanel';
import CitusPanel from '@/components/CitusPanel';
import CargoPanel from '@/components/CargoPanel';
import CpuStatsPanel from '@/components/CpuStatsPanel';
import DeltaLakePanel from '@/components/DeltaLakePanel';
import DockerComposePanel from '@/components/DockerComposePanel';
import ExternalDnsPanel from '@/components/ExternalDnsPanel';
import GatlingPanel from '@/components/GatlingPanel';
import GrafanaFaroPanel from '@/components/GrafanaFaroPanel';
import HyperfinePanel from '@/components/HyperfinePanel';
import IpAddrPanel from '@/components/IpAddrPanel';
import BuildOutputPanel from '@/components/BuildOutputPanel';
import CniPanel from '@/components/CniPanel';
import CurlVerbosePanel from '@/components/CurlVerbosePanel';
import FreeMemPanel from '@/components/FreeMemPanel';
import JournaldPanel from '@/components/JournaldPanel';
import KubeAuditPanel from '@/components/KubeAuditPanel';
import KubescapePanel from '@/components/KubescapePanel';
import LonghornPanel from '@/components/LonghornPanel';
import MtrPanel from '@/components/MtrPanel';
import NvidiaSmiPanel from '@/components/NvidiaSmiPanel';
import OtelCollectorPanel from '@/components/OtelCollectorPanel';
import PerfStatPanel from '@/components/PerfStatPanel';
import PostgresReplPanel from '@/components/PostgresReplPanel';
import PingPanel from '@/components/PingPanel';
import PyroscopePanel from '@/components/PyroscopePanel';
import RedpandaPanel from '@/components/RedpandaPanel';
import VmstatPanel from '@/components/VmstatPanel';
import TektonPanel from '@/components/TektonPanel';
import TempoPanel from '@/components/TempoPanel';
import SslCertPanel from '@/components/SslCertPanel';
import TemporalWorkflowPanel from '@/components/TemporalWorkflowPanel';
import SysdigPanel from '@/components/SysdigPanel';
import ActPanel from '@/components/ActPanel';
import AlertManagerPanel from '@/components/AlertManagerPanel';
import AnsiblePlaybookPanel from '@/components/AnsiblePlaybookPanel';
import ArgoCDPanel from '@/components/ArgoCDPanel';
import ArgoEventsPanel from '@/components/ArgoEventsPanel';
import ArgoWorkflowsPanel from '@/components/ArgoWorkflowsPanel';
import AtlasPanel from '@/components/AtlasPanel';
import AuditdPanel from '@/components/AuditdPanel';
import AwsCliPanel from '@/components/AwsCliPanel';
import BackstagePanel from '@/components/BackstagePanel';
import BazelPanel from '@/components/BazelPanel';
import BenthosPanel from '@/components/BenthosPanel';
import BeylaPanel from '@/components/BeylaPanel';
import BgpLookupPanel from '@/components/BgpLookupPanel';
import BiomePanel from '@/components/BiomePanel';
import BoundaryPanel from '@/components/BoundaryPanel';
import BpftracePanel from '@/components/BpftracePanel';
import BrewListPanel from '@/components/BrewListPanel';
import BufPanel from '@/components/BufPanel';
import BundleAnalysisPanel from '@/components/BundleAnalysisPanel';
import CaddyAccessPanel from '@/components/CaddyAccessPanel';
import CaddyPanel from '@/components/CaddyPanel';
import CassandraPanel from '@/components/CassandraPanel';
import CertInfoPanel from '@/components/CertInfoPanel';

export const metadata: Metadata = {
  title: 'Work With Us',
  description:
    'Construx Group builds AI-first products for clients who need something built properly. Here is how engagements work.',
};

const capabilities = [
  {
    icon: Zap,
    title: 'AI-first product building',
    body: 'We architect products from the ground up around AI capabilities — not bolted on after the fact. LLM integration, prompt engineering, RAG pipelines, agent architectures.',
    accent: '#F97316',
  },
  {
    icon: Code2,
    title: 'Full-stack development',
    body: 'End-to-end product delivery: React/Next.js frontends, serverless backends, database design, CI/CD, AWS infrastructure. We build and we ship.',
    accent: '#3B82F6',
  },
  {
    icon: Layers,
    title: 'Product strategy',
    body: 'We help teams figure out what to build with AI before they build it. Market framing, user research, product definition, and go-to-market approach.',
    accent: '#8B5CF6',
  },
  {
    icon: Rocket,
    title: 'Fast prototyping',
    body: 'From zero to a working, deployed prototype in days. Useful for validating a market, securing investment, or unblocking a team that needs to see something real.',
    accent: '#C8F50C',
  },
];

const process = [
  {
    step: '01',
    title: 'Discovery call',
    body: "A focused 45-minute conversation to understand what you want to build, why, and what success looks like. We'll be direct about whether it's a fit.",
  },
  {
    step: '02',
    title: 'Proposal',
    body: 'A clear scope of work, timeline, and fixed price. No vague retainers. No hourly billing that incentivises slow work.',
  },
  {
    step: '03',
    title: 'Build',
    body: 'We work fast, communicate clearly, and show you working software early. No long silences followed by a big reveal.',
  },
  {
    step: '04',
    title: 'Ship & hand over',
    body: "Deployed, documented, and handed over with everything you need to run it. We're available for ongoing support if you need it.",
  },
];

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI-First Product Development',
  description: 'Construx Group builds AI-first software products for organisations that need something built properly — from architecture to deployment.',
  provider: { '@type': 'Organization', name: 'Construx Group', url: 'https://construxgroup.io' },
  serviceType: ['AI Product Development', 'Full-stack Development', 'Product Strategy', 'Rapid Prototyping'],
  areaServed: 'Worldwide',
  url: 'https://construxgroup.io/work-with-us',
};

export default function WorkWithUsPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5 overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-4xl">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-5 animate-fade-in">
            // CLIENT WORK
          </p>
          <h1 className="text-display text-text-base mb-6 leading-none animate-fade-up"
            style={{ animationDelay: '90ms' }}>
            Work<br />
            <span className="text-gradient-orange">With Us</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-xl mb-10 animate-fade-up"
            style={{ animationDelay: '220ms' }}>
            We build AI-first products for organisations who need something built properly —
            not a slide deck, not a POC that falls apart under load, but a real product that ships.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '360ms' }}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_24px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:scale-[1.02] uppercase tracking-wider"
              style={{ borderRadius: '3px' }}
            >
              Start the conversation <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="px-5 py-20 mx-auto max-w-6xl">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-10">
          // WHAT WE BUILD
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="flex flex-col overflow-hidden"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${accent}18`,
                borderRadius: '3px',
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-2 px-3 py-2 flex-shrink-0 select-none"
                style={{ background: `${accent}08`, borderBottom: `1px solid ${accent}12` }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span
                  className="font-mono text-[8px] uppercase tracking-[0.18em] flex-1 text-center truncate"
                  style={{ color: `${accent}60` }}
                >
                  construx.capabilities
                </span>
              </div>
              {/* Shell prompt */}
              <div className="px-3 py-1.5 select-none" style={{ borderBottom: `1px solid ${accent}08`, background: 'rgba(255,255,255,0.01)' }}>
                <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
                <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{`construx capabilities --module=${title.toLowerCase().replace(/\s+/g, '-')}`}</span>
              </div>
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div
                  className="h-9 w-9 flex items-center justify-center"
                  style={{ background: `${accent}14`, color: accent, borderRadius: '3px' }}
                >
                  <Icon size={17} />
                </div>
                <h3 className="text-sm font-bold text-text-base">{title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-12 pb-20 mx-auto max-w-4xl border-t border-border">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-8">
          // HOW IT WORKS
        </h2>
        <div
          className="overflow-hidden"
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
            style={{ borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-dim/50 flex-1 text-center">
              construx.process — engagement.flow
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
              ● ACTIVE
            </span>
          </div>
          {/* Shell prompt */}
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="font-mono text-[10px]" style={{ color: 'rgba(249,115,22,0.5)' }}>construx@sys:~$</span>
            <span className="font-mono text-[10px] ml-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              construx engage --trace --steps=all
            </span>
          </div>
          {/* Steps */}
          <div className="flex flex-col" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {process.map((p, i) => (
              <div
                key={p.step}
                className="flex gap-5 px-5 py-5"
                style={i < process.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}
              >
                <div className="flex-shrink-0 font-mono text-[10px] pt-0.5 tabular-nums" style={{ color: 'rgba(249,115,22,0.45)' }}>
                  [{p.step}]
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="font-mono text-xs font-semibold text-construx">{p.title}</div>
                  <p className="text-sm text-text-muted leading-relaxed">{p.body}</p>
                </div>
                <div className="flex-shrink-0 pt-0.5">
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.4)' }}>
                    ● ok
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Status footer */}
          <div
            className="flex items-center justify-between px-5 py-1.5"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <span className="font-mono text-[8px]" style={{ color: 'rgba(249,115,22,0.3)' }}>
              engagement.flow / {process.length} steps
            </span>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>
              exit: 0
            </span>
          </div>
        </div>
      </section>

      {/* Recommended reading */}
      <div className="px-5 pb-10 mx-auto max-w-4xl flex flex-wrap gap-5">
        <Link
          href="/journal/how-we-ship"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-construx hover:text-orange-400 transition-colors uppercase tracking-widest group"
        >
          <ExternalLink size={11} className="flex-shrink-0" />
          The full build loop
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/journal/ai-speed-cuts-both-ways"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest group"
        >
          <ExternalLink size={11} className="flex-shrink-0" />
          Why direction matters more than speed
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/journal/building-this-website"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest group"
        >
          <ExternalLink size={11} className="flex-shrink-0" />
          How this site was built
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/journal/the-sprint-format"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest group"
        >
          <ExternalLink size={11} className="flex-shrink-0" />
          The two-week sprint breakdown
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/journal/pre-ship-checklist"
          className="inline-flex items-center gap-2 font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest group"
        >
          <ExternalLink size={11} className="flex-shrink-0" />
          How we ship to production
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Not a fit */}
      <section className="px-5 pb-6 mx-auto max-w-4xl">
        <div
          className="overflow-hidden"
          style={{
            background: 'rgba(3,3,14,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '3px',
          }}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 select-none"
            style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-dim flex-1 text-center">
              construx.filter — probably not a fit
            </span>
          </div>
          {/* Shell prompt */}
          <div className="px-5 py-2 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
            <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
            <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>cat /etc/construx/filter.rules</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 mb-5">
              {[
                'Long-term on-site staff augmentation',
                'Projects that could have been built in 2020',
                'Hourly billing or open-ended retainers',
                'Design agencies or branding-only work',
                'Six-month sprints with monthly check-ins',
                'Teams that want the AI layer bolted on after',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="font-mono text-[10px] text-red-500/40 flex-shrink-0 mt-0.5">×</span>
                  <span className="text-sm text-text-dim leading-snug">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-text-muted leading-relaxed border-t border-border pt-4">
              If none of those apply, we'd genuinely like to hear what you're building.
            </p>
          </div>
        </div>
      </section>

      {/* Technical stack */}
      <section className="px-5 py-16 mx-auto max-w-6xl border-t border-border">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-8">
          // TECHNICAL STACK
        </h2>
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
              construx.stack — sys.dependencies
            </span>
            <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(249,115,22,0.4)' }}>
              12 modules
            </span>
          </div>
          {/* Shell prompt */}
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="font-mono text-[10px]" style={{ color: 'rgba(249,115,22,0.5)' }}>construx@sys:~$</span>
            <span className="font-mono text-[10px] ml-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              cat /etc/construx/stack.json | jq .dependencies
            </span>
          </div>
          {/* Stack grid */}
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Next.js', category: 'Frontend' },
                { label: 'React', category: 'Frontend' },
                { label: 'TypeScript', category: 'Language' },
                { label: 'Tailwind CSS', category: 'Styling' },
                { label: 'Claude API', category: 'AI' },
                { label: 'Claude Code', category: 'AI' },
                { label: 'AWS Amplify', category: 'Infra' },
                { label: 'Node.js', category: 'Backend' },
                { label: 'PostgreSQL', category: 'Database' },
                { label: 'React Three Fiber', category: '3D' },
                { label: 'Framer Motion', category: 'Animation' },
                { label: 'Resend', category: 'Email' },
              ].map(({ label, category }) => (
                <div
                  key={label}
                  className="flex flex-col px-3 py-3 gap-1"
                  style={{
                    background: 'rgba(5,5,18,0.6)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '3px',
                  }}
                >
                  <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-construx/60">{category}</p>
                  <p className="text-sm font-semibold text-text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Status footer */}
          <div
            className="flex items-center justify-between px-5 py-1.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}
          >
            <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
              stack.ver / production
            </span>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.35)' }}>
              ● all deps resolved
            </span>
          </div>
        </div>
      </section>

      {/* Proof of work */}
      <section className="px-5 py-16 mx-auto max-w-6xl border-t border-border">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-8">
          // PROOF OF WORK
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: 'Scoutr',
              accent: '#C8F50C',
              category: 'Resell Intelligence',
              headline: 'From zero to live in 3 weeks',
              summary: 'Full-stack AI product with real-time product scanning, Amazon + eBay profit calculation, and Claude-powered classification. Users paste a URL, get actionable margin data in under 5 seconds.',
              stats: [{ label: 'Time to scan', value: '<5s' }, { label: 'Live', value: 'Yes' }],
              journalSlug: 'building-scoutr',
            },
            {
              name: 'The Marqet',
              accent: '#3B82F6',
              category: 'AI Marketplace',
              headline: '167+ listings, built in weeks',
              summary: 'AI-native marketplace for professional Claude configurations. Custom CMS, semantic search, category filtering, and a content pipeline that generated 167 listings across 4 verticals without manual work.',
              stats: [{ label: 'Listings', value: '167+' }, { label: 'Live', value: 'Yes' }],
              journalSlug: 'the-marqet-167-listings',
            },
            {
              name: 'The Hyve',
              accent: '#8B5CF6',
              category: 'AI Workspace',
              headline: 'Replaced 4 tools with one',
              summary: 'Full-stack workspace replacing Slack, Notion, GitHub discussions, and Discord. Real-time channels, kanban, docs, and a vector-memory AI team member — all in a single URL on AWS.',
              stats: [{ label: 'Tools replaced', value: '4' }, { label: 'Live', value: 'Yes' }],
              journalSlug: 'building-the-hyve',
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex flex-col overflow-hidden"
              style={{
                background: 'rgba(3,3,14,0.8)',
                border: `1px solid ${item.accent}18`,
                borderRadius: '3px',
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-2 px-3 py-2 flex-shrink-0 select-none"
                style={{ background: `${item.accent}08`, borderBottom: `1px solid ${item.accent}14` }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: `${item.accent}60` }}>
                  construx.proof — {item.name.toLowerCase()}
                </span>
              </div>
              {/* Shell prompt */}
              <div className="px-3 py-1.5 select-none" style={{ borderBottom: `1px solid ${item.accent}08`, background: 'rgba(255,255,255,0.01)' }}>
                <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
                <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{`construx proof --venture=${item.name.toLowerCase().replace(/\s+/g, '-')}`}</span>
              </div>
              <div className="flex flex-col p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-8 w-8 rounded-full flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${item.accent}cc, ${item.accent}44)`,
                    boxShadow: `0 0 14px ${item.accent}44`,
                  }}
                />
                <div>
                  <p className="text-sm font-bold text-text-base">{item.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: item.accent, opacity: 0.8 }}>
                    {item.category}
                  </p>
                </div>
              </div>
              <p className="text-xs font-semibold mb-2" style={{ color: item.accent }}>
                {item.headline}
              </p>
              <p className="text-xs text-text-muted leading-relaxed flex-1 mb-4">
                {item.summary}
              </p>
              <div className="flex items-end justify-between gap-3 mt-auto">
                <div className="flex gap-3">
                  {item.stats.map((s) => (
                    <div
                      key={s.label}
                      className="px-2.5 py-1.5 flex flex-col"
                      style={{
                        background: `${item.accent}08`,
                        border: `1px solid ${item.accent}18`,
                        borderRadius: '2px',
                      }}
                    >
                      <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: item.accent }}>{s.value}</span>
                      <span className="font-mono text-[9px] text-text-dim uppercase tracking-wider">{s.label}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/journal/${item.journalSlug}`}
                  className="flex items-center gap-1 font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors uppercase tracking-wider flex-shrink-0"
                >
                  <BookOpen size={10} />
                  Story
                </Link>
              </div>
              </div>
              {/* Status footer */}
              <div
                className="flex items-center justify-between px-3 py-1.5 select-none"
                style={{ borderTop: `1px solid ${item.accent}10`, background: 'rgba(0,0,0,0.25)' }}
              >
                <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: `${item.accent}35` }}>
                  {item.name.toLowerCase().replace(' ', '.')}.module
                </span>
                <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.35)' }}>● live</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CI pipeline status */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <CIPipelinePanel />
      </section>

      {/* Docker container stats */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <DockerStatsPanel />
      </section>

      {/* Terraform engagement plan */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <TerraformPlanPanel />
      </section>

      {/* Kubernetes pods */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <KubectlPodsPanel />
      </section>

      {/* Nmap port scan */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <NmapScanPanel />
      </section>

      {/* Kubernetes events */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <K8sEventsPanel />
      </section>

      {/* Helm releases */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <HelmChartPanel />
      </section>

      {/* Prometheus metrics */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <PrometheusMetricsPanel />
      </section>

      {/* Kubectl logs */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <KubectlLogsPanel />
      </section>

      {/* Argo rollout progress */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <ArgoRolloutPanel />
      </section>

      {/* Vault secrets management */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <VaultSecretsPanel />
      </section>

      {/* Flux CD GitOps reconciliation */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <FluxCdPanel />
      </section>

      {/* Tailscale tailnet device status */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <TailnetStatusPanel />
      </section>

      {/* GitHub Actions workflow run */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <GhActionsRunPanel />
      </section>

      {/* Packer AMI build */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <PackerBuildPanel />
      </section>

      {/* Envoy proxy stats */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <EnvoyStatsPanel />
      </section>

      {/* Trivy container vulnerability scan */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <TrivyVulnPanel />
      </section>

      {/* Velero Kubernetes backup */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <VeleroPanel />
      </section>

      {/* Pulumi infrastructure as code */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <PulumiPanel />
      </section>

      {/* rclone cloud storage sync */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <RclonePanel />
      </section>

      {/* vals secret interpolation */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <ValsPanel />
      </section>

      {/* victoriametrics high-performance TSDB */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <VictoriaMetricsPanel />
      </section>

      {/* materialize streaming sql — incremental views over kafka */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <MaterializePanel />
      </section>

      {/* vitess mysql sharding — vtgate, vtctldclient, vschema, resharding */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <VitessPanel />
      </section>

      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <MinIOPanel />
      </section>

      {/* nats jetstream persistent messaging — streams, consumers, kv store, clustering */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <NATSJetStreamPanel />
      </section>

      {/* renovate automated dependency updates — grouping, automerge, schedule, datasources */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <RenovatePanel />
      </section>

      {/* strimzi kafka on kubernetes — kraft, topics, mtls, cruise-control */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <StrimziPanel />
      </section>

      {/* vcluster virtual kubernetes clusters — k3s/k0s/eks, sync, multi-tenant */}
      <section className="px-5 pb-10 mx-auto max-w-6xl">
        <VclusterPanel />
      </section>

      {/* zitadel cloud-native iam — oidc/saml/passkeys, apps, sessions, tokens */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <ZitadelPanel />
      </section>

      {/* rekor sigstore transparency log — supply chain security, attestations, policies */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <RekorPanel />
      </section>

      {/* harbor oci registry — image repos, trivy scans, cosign signatures */}
      <section className="px-5 pb-10 mx-auto max-w-6xl">
        <HarborPanel />
      </section>

      {/* river postgres-backed job queue — queues, jobs, throughput */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <RiverPanel />
      </section>

      {/* earthly repeatable builds — earthfile targets, buildkit, cache */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <EarthlyPanel />
      </section>

      {/* typesense instant typo-tolerant search — collections, searches, raft cluster */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <TypesensePanel />
      </section>

      {/* prefect workflow orchestration — deployments, flow runs, work pools */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <PrefectPanel />
      </section>

      {/* spicedb zanzibar authz — schema, relationships, permission checks */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <SpiceDbPanel />
      </section>

      {/* stepsecurity cicd hardening — scorecard, harden-runner, findings */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <StepSecurityPanel />
      </section>

      {/* grype vulnerability scanner — cve, cvss, containers, sbom */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <GrypePanel />
      </section>

      {/* cyclonedx sbom — components, licenses, vex vulnerability exchange */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <CycloneDxPanel />
      </section>

      {/* syft sbom generator — packages, cpes, ecosystems */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <SyftPanel />
      </section>

      {/* openssf scorecard — supply chain checks, scores */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <ScorecardPanel />
      </section>

      {/* spire workload identity — svids, bundles, agents */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <SpirePanel />
      </section>

      {/* gitea self-hosted git — repos, pushes, ci */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <GiteaPanel />
      </section>

      {/* grafana oncall incident mgmt — escalations, alerts, oncall */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <GrafanaOnCallPanel />
      </section>

      {/* gatekeeper policy controller — constraints, rego, audit */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <GatekeeperPanel />
      </section>

      {/* apache pulsar messaging — topics, subscriptions, geo-replication */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <PulsarPanel />
      </section>

      {/* nomad workload orchestrator — jobs, allocations, clients */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <NomadPanel />
      </section>

      {/* clickhouse keeper raft coordination — servers, znodes, replication */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <ClickHouseKeeperPanel />
      </section>

      {/* pinecone vector database — indexes, embeddings, similarity search */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <PineconePanel />
      </section>

      {/* weaviate vector database — classes, objects, semantic search */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <WeaviatePanel />
      </section>

      {/* tigerbeetle financial database — accounts, transfers, ledger */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <TigerBeetlePanel />
      </section>

      {/* zarf air-gapped deployment — packages, components, registry */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <ZarfPanel />
      </section>

      {/* kind kubernetes in docker — clusters, nodes, contexts */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <KindPanel />
      </section>

      {/* bun js runtime build — transpile, bundle, test */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BunBuildPanel />
      </section>

      {/* typescript type check — errors, files, diagnostics */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <TypeCheckPanel />
      </section>

      {/* cilium ebpf networking — endpoints, policy, hubble flows */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CiliumPanel />
      </section>

      {/* dapr distributed application runtime — actors, pub/sub, state */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <DaprPanel />
      </section>

      {/* airflow dag orchestration — celery, sensors, xcom, dynamic tasks */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AirflowPanel />
      </section>

      {/* flink stateful stream processing — exactly-once, windows, checkpoints */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <FlinkPanel />
      </section>

      {/* airbyte open-source elt — connectors, syncs, data movement */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AirbytePanel />
      </section>

      {/* spiffe workload identity — svids, trust bundles, federation */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <SpiffePanel />
      </section>

      {/* goreleaser — release automation, binaries, docker, changelog */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <GoReleaserPanel />
      </section>

      {/* authentik — identity provider, sso, oauth, ldap */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AuthentikPanel />
      </section>

      {/* aws bedrock — foundation models, inference, agents */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AwsBedrockPanel />
      </section>

      {/* ceph — distributed storage, osds, pools, pg health */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CephPanel />
      </section>

      {/* citus — distributed postgres, shards, workers, tables */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CitusPanel />
      </section>

      {/* cargo — rust build, deps, features, publish */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CargoPanel />
      </section>

      {/* cpu stats — usage, load, cores, frequencies */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CpuStatsPanel />
      </section>

      {/* delta lake — tables, history, partitions, vacuum */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <DeltaLakePanel />
      </section>

      {/* docker compose — services, networks, volumes, health */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <DockerComposePanel />
      </section>

      {/* external dns — sync, providers, endpoints, records */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <ExternalDnsPanel />
      </section>

      {/* gatling — load testing, simulations, rps, response times */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <GatlingPanel />
      </section>

      {/* grafana faro — frontend observability, errors, sessions, traces */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <GrafanaFaroPanel />
      </section>

      {/* hyperfine — cli benchmark, runs, mean, stddev, outliers */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <HyperfinePanel />
      </section>

      {/* ip addr — interfaces, addresses, states, mtu */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <IpAddrPanel />
      </section>

      {/* build output — steps, artifacts, duration, cache hits */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BuildOutputPanel />
      </section>

      {/* cni — plugins, network, ipam, bridges */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CniPanel />
      </section>

      {/* curl verbose — dns, connect, tls, transfer timings */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CurlVerbosePanel />
      </section>

      {/* free mem — total, used, free, shared, available */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <FreeMemPanel />
      </section>

      {/* journald — structured logs, transport, fields, priority */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <JournaldPanel />
      </section>

      {/* kube audit — events, verbs, resources, users */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <KubeAuditPanel />
      </section>

      {/* kubescape — controls, risk, frameworks, severity */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <KubescapePanel />
      </section>

      {/* longhorn — volumes, replicas, nodes, snapshots */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <LonghornPanel />
      </section>

      {/* mtr — hops, loss, latency, jitter, asn */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <MtrPanel />
      </section>

      {/* nvidia smi — gpu, vram, temp, util, power */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <NvidiaSmiPanel />
      </section>

      {/* otel collector — pipelines, receivers, processors, exporters */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <OtelCollectorPanel />
      </section>

      {/* perf stat — cycles, instructions, cache, branches */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <PerfStatPanel />
      </section>

      {/* postgres repl — wal, slots, lag, standby */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <PostgresReplPanel />
      </section>

      {/* ping — rtt, loss, ttl, icmp, hosts */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <PingPanel />
      </section>

      {/* pyroscope — continuous profiling, pprof, flamegraph, ebpf */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <PyroscopePanel />
      </section>

      {/* redpanda — kafka-compatible, no jvm, raft, throughput */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <RedpandaPanel />
      </section>

      {/* vmstat — memory, swap, io, cpu, system counters */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <VmstatPanel />
      </section>

      {/* tekton — k8s-native ci, tasks, pipelines, chains, cosign */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <TektonPanel />
      </section>

      {/* tempo — grafana distributed tracing, traces, spans, tenants */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <TempoPanel />
      </section>

      {/* ssl cert — x509, issuer, san, expiry, chain */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <SslCertPanel />
      </section>

      {/* temporal workflow — durable execution, activities, signals */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <TemporalWorkflowPanel />
      </section>

      {/* sysdig — container-aware syscall tracing, events, processes */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <SysdigPanel />
      </section>

      {/* act — github actions local runner, jobs, steps, env */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <ActPanel />
      </section>

      {/* alertmanager — prometheus alerts, groups, silences, receivers */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AlertManagerPanel />
      </section>

      {/* ansible playbook — tasks, hosts, roles, handlers, inventory */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AnsiblePlaybookPanel />
      </section>

      {/* argo cd — gitops, sync, apps, rollbacks */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <ArgoCDPanel />
      </section>

      {/* argo events — event-driven workflows, event sources, sensors, triggers */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <ArgoEventsPanel />
      </section>

      {/* argo workflows — dag pipelines, ml training, artifacts, parallel steps */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <ArgoWorkflowsPanel />
      </section>

      {/* atlas database schema management — migrations, drift, ci */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AtlasPanel />
      </section>

      {/* auditd linux audit framework — syscalls, events, rules, trails */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AuditdPanel />
      </section>

      {/* aws cli — s3, ec2, iam, lambda commands */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <AwsCliPanel />
      </section>

      {/* backstage developer portal — catalog, tech radar, plugins */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BackstagePanel />
      </section>

      {/* bazel hermetic build — remote cache, targets, action cache stats */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BazelPanel />
      </section>

      {/* benthos stream processor — pipelines, bloblang, fanout */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BenthosPanel />
      </section>

      {/* beyla ebpf auto-instrumentation — spans, latency, red metrics */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BeylaPanel />
      </section>

      {/* bgp routing table lookup — asn, prefixes, peers, path */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BgpLookupPanel />
      </section>

      {/* biome js toolchain — lint, format, check, ci */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BiomePanel />
      </section>

      {/* boundary zero-trust infrastructure access — targets, sessions, policies */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BoundaryPanel />
      </section>

      {/* bpftrace kernel tracing — probes, maps, scripts, hist */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BpftracePanel />
      </section>

      {/* brew list — installed formulae, casks, versions */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BrewListPanel />
      </section>

      {/* buf protobuf lint, breaking, generate, push */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BufPanel />
      </section>

      {/* bundle analysis — size, chunks, treeshake, deps */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <BundleAnalysisPanel />
      </section>

      {/* caddy access log — requests, status, latency, bytes */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CaddyAccessPanel />
      </section>

      {/* caddy reverse proxy — routes, tls, upstreams, logs */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CaddyPanel />
      </section>

      {/* cassandra query — keyspace, table, cql, latency */}
      <section className="px-5 pb-4 mx-auto max-w-6xl">
        <CassandraPanel />
      </section>

      {/* tls certificate info — san, validity, issuer, chain */}
      <section className="px-5 pb-6 mx-auto max-w-6xl">
        <CertInfoPanel />
      </section>

      {/* CTA */}
      <section className="px-5 py-20 mx-auto max-w-2xl">
        <div
          className="overflow-hidden"
          style={{
            background: 'rgba(3,3,14,0.97)',
            border: '1px solid rgba(249,115,22,0.18)',
            borderRadius: '6px',
            boxShadow: '0 0 60px rgba(249,115,22,0.07), 0 20px 60px rgba(0,0,0,0.7)',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 select-none"
            style={{ borderBottom: '1px solid rgba(249,115,22,0.1)', background: 'rgba(249,115,22,0.025)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim/50 flex-1 text-center">
              construx.engage — build.init
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
              ● READY
            </span>
          </div>

          <div className="px-8 py-10">
            {/* Shell output */}
            <div className="font-mono text-[11px] flex flex-col gap-1 mb-8">
              <div className="flex gap-3">
                <span style={{ color: 'rgba(249,115,22,0.6)' }}>$</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>construx engage --mode=ai-first --quality=production</span>
              </div>
              <div className="flex gap-3">
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>{'>'}</span>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>Checking project viability... OK</span>
              </div>
              <div className="flex gap-3">
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>{'>'}</span>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>Loading Claude integration layer... OK</span>
              </div>
              <div className="flex gap-3">
                <span style={{ color: 'rgba(74,222,128,0.6)' }}>✓</span>
                <span style={{ color: 'rgba(74,222,128,0.85)' }}>Ready to build. Awaiting brief.</span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center mb-6">
              <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4">
                // ENGAGE
              </p>
              <h2 className="text-display-sm text-text-base mb-4">
                Ready to build something?
              </h2>
              <p className="text-text-muted leading-relaxed max-w-md mx-auto">
                If you have a product you want to build AI-first — properly, without shortcuts —
                we'd like to hear about it.
              </p>
            </div>

            <div className="flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-mono text-sm font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-[1.02] uppercase tracking-wider"
                style={{ borderRadius: '3px' }}
              >
                Get in touch <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Status bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5"
            style={{ borderTop: '1px solid rgba(249,115,22,0.08)', background: 'rgba(0,0,0,0.3)' }}
          >
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.35)' }}>
              construx@sys
            </span>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>
              session:active
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
