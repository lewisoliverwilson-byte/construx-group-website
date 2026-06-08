'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import LatencyMapPanel from '@/components/LatencyMapPanel';
import TraceroutePanel from '@/components/TraceroutePanel';
import WhoisPanel from '@/components/WhoisPanel';
import SslCertPanel from '@/components/SslCertPanel';
import DnsLookupPanel from '@/components/DnsLookupPanel';
import HttpBenchPanel from '@/components/HttpBenchPanel';
import SpfDkimPanel from '@/components/SpfDkimPanel';
import TlsHandshakePanel from '@/components/TlsHandshakePanel';
import MtrPanel from '@/components/MtrPanel';
import SecurityHeadersPanel from '@/components/SecurityHeadersPanel';
import TsharkPacketPanel from '@/components/TsharkPacketPanel';
import CaddyAccessPanel from '@/components/CaddyAccessPanel';
import CertInfoPanel from '@/components/CertInfoPanel';
import GrpcCallPanel from '@/components/GrpcCallPanel';
import PostgresReplPanel from '@/components/PostgresReplPanel';
import WasmComponentPanel from '@/components/WasmComponentPanel';
import BgpLookupPanel from '@/components/BgpLookupPanel';
import CurlVerbosePanel from '@/components/CurlVerbosePanel';
import DigPanel from '@/components/DigPanel';
import StepCliPanel from '@/components/StepCliPanel';
import CrossplanePanel from '@/components/CrossplanePanel';
import RedpandaPanel from '@/components/RedpandaPanel';
import CockroachDbPanel from '@/components/CockroachDbPanel';
import CitusPanel from '@/components/CitusPanel';
import EtcdPanel from '@/components/EtcdPanel';
import TektonPanel from '@/components/TektonPanel';
import ExternalDnsPanel from '@/components/ExternalDnsPanel';
import KubescapePanel from '@/components/KubescapePanel';
import IcebergPanel from '@/components/IcebergPanel';
import WasmEdgePanel from '@/components/WasmEdgePanel';
import BazelPanel from '@/components/BazelPanel';
import ClickhouseMigrationPanel from '@/components/ClickhouseMigrationPanel';
import TemporalPanel from '@/components/TemporalPanel';
import TeleportPanel from '@/components/TeleportPanel';
import PortainerPanel from '@/components/PortainerPanel';
import AirbytePanel from '@/components/AirbytePanel';
import KubernetesGatewayPanel from '@/components/KubernetesGatewayPanel';
import CrunchyPostgresPanel from '@/components/CrunchyPostgresPanel';
import GatlingPanel from '@/components/GatlingPanel';
import K6Panel from '@/components/K6Panel';
import LitestreamPanel from '@/components/LitestreamPanel';
import BenthosPanel from '@/components/BenthosPanel';
import ConsulPanel from '@/components/ConsulPanel';
import PatroniPanel from '@/components/PatroniPanel';
import MinIOPanel from '@/components/MinIOPanel';
import VaultPanel from '@/components/VaultPanel';
import CaddyPanel from '@/components/CaddyPanel';
import IstioPanel from '@/components/IstioPanel';
import OPAPanel from '@/components/OPAPanel';
import FluentBitPanel from '@/components/FluentBitPanel';
import AlertManagerPanel from '@/components/AlertManagerPanel';
import NeonPanel from '@/components/NeonPanel';
import OllamaPanel from '@/components/OllamaPanel';
import GrpcurlPanel from '@/components/GrpcurlPanel';
import NmapScanPanel from '@/components/NmapScanPanel';
import SpirePanel from '@/components/SpirePanel';
import DaprPanel from '@/components/DaprPanel';
import CiliumPanel from '@/components/CiliumPanel';
import NATSJetStreamPanel from '@/components/NATSJetStreamPanel';
import AirflowPanel from '@/components/AirflowPanel';
import FlinkPanel from '@/components/FlinkPanel';
import GoReleaserPanel from '@/components/GoReleaserPanel';
import KafkaConnectPanel from '@/components/KafkaConnectPanel';
import ArgoCDPanel from '@/components/ArgoCDPanel';
import BrewListPanel from '@/components/BrewListPanel';
import CosignPanel from '@/components/CosignPanel';
import DruidPanel from '@/components/DruidPanel';
import EnvoyStatsPanel from '@/components/EnvoyStatsPanel';
import GitConfigPanel from '@/components/GitConfigPanel';
import HttpArchivePanel from '@/components/HttpArchivePanel';
import K3sPanel from '@/components/K3sPanel';
import KafkaStreamsPanel from '@/components/KafkaStreamsPanel';
import KubectlLogsPanel from '@/components/KubectlLogsPanel';
import KyvernoPanel from '@/components/KyvernoPanel';
import LshwPanel from '@/components/LshwPanel';
import AwsCliPanel from '@/components/AwsCliPanel';
import ActPanel from '@/components/ActPanel';
import CpuStatsPanel from '@/components/CpuStatsPanel';
import GiteaPanel from '@/components/GiteaPanel';
import NeofetchPanel from '@/components/NeofetchPanel';
import NixShellPanel from '@/components/NixShellPanel';
import OAuthFlowPanel from '@/components/OAuthFlowPanel';
import OpensslPanel from '@/components/OpensslPanel';
import PgvectorPanel from '@/components/PgvectorPanel';
import PrometheusMetricsPanel from '@/components/PrometheusMetricsPanel';
import RenovatePanel from '@/components/RenovatePanel';
import SbomPanel from '@/components/SbomPanel';
import IpLinkPanel from '@/components/IpLinkPanel';
import SigstorePanel from '@/components/SigstorePanel';
import SpiceDBPanel from '@/components/SpiceDBPanel';
import StrimziPanel from '@/components/StrimziPanel';
import TrivyScanPanel from '@/components/TrivyScanPanel';
import TigerBeetlePanel from '@/components/TigerBeetlePanel';
import TechFreqPanel from '@/components/TechFreqPanel';
import TerraformPanel from '@/components/TerraformPanel';
import UptimePanel from '@/components/UptimePanel';
import AnsiblePlaybookPanel from '@/components/AnsiblePlaybookPanel';
import ArgoEventsPanel from '@/components/ArgoEventsPanel';
import ArgoRolloutPanel from '@/components/ArgoRolloutPanel';
import ArgoWorkflowsPanel from '@/components/ArgoWorkflowsPanel';
import AtlasPanel from '@/components/AtlasPanel';
import AuditdPanel from '@/components/AuditdPanel';
import AuthentikPanel from '@/components/AuthentikPanel';
import AwsBedrockPanel from '@/components/AwsBedrockPanel';
import BackstagePanel from '@/components/BackstagePanel';
import BeylaPanel from '@/components/BeylaPanel';
import BiomePanel from '@/components/BiomePanel';

type Status = 'idle' | 'loading' | 'success' | 'error';

const topics = [
  'Working together',
  'Partnership / collaboration',
  'Press enquiry',
  'Venture feedback',
  'Something else',
];

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message too short (min 20 chars)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setForm({ name: '', email: '', topic: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type: string = 'text',
    placeholder: string = '',
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-text-dim">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={form[id]}
        onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
        placeholder={placeholder}
        autoComplete={id === 'email' ? 'email' : id === 'name' ? 'name' : 'off'}
        className="w-full px-4 py-3 text-sm text-text-base placeholder:text-text-dim transition-all outline-none focus:border-construx/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]"
        style={{
          background: 'rgba(5,5,18,0.8)',
          border: errors[id] ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '2px',
        }}
      />
      {errors[id] && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={11} /> {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4 animate-fade-in">
            // GET IN TOUCH
          </p>
          <h1 className="text-display text-text-base mb-5 leading-none animate-fade-up"
            style={{ animationDelay: '90ms' }}>
            <span className="text-gradient-orange">Contact</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-md mx-auto animate-fade-up"
            style={{ animationDelay: '220ms' }}>
            We respond to every message. Usually same day.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 mx-auto max-w-2xl">
        {status === 'success' ? (
          <div
            className="overflow-hidden text-center"
            style={{ background: 'rgba(3,3,14,0.9)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '3px', boxShadow: '0 0 32px rgba(16,185,129,0.06)' }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 border-b select-none"
              style={{ borderColor: 'rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.03)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-dim flex-1 text-center">
                construx.contact — transmission.ok
              </span>
            </div>
            {/* Shell prompt */}
            <div
              className="px-4 py-1.5 select-none"
              style={{ borderBottom: '1px solid rgba(16,185,129,0.12)', background: 'rgba(16,185,129,0.02)' }}
            >
              <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.5)' }}>
                construx@sys:~$
              </span>
              <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>
                construx contact --status
              </span>
            </div>
            <div className="px-8 py-12">
              <CheckCircle className="mx-auto mb-5 text-emerald-400" size={32} />
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400 mb-3">TRANSMISSION.OK</p>
              <h2 className="text-lg font-bold text-text-base mb-3">Message sent.</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                We've received your message. We respond to every message — usually same day, always within 24 hours.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 font-mono text-[10px] uppercase tracking-widest text-construx hover:text-orange-400 transition-colors"
              >
                Send another ›
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="overflow-hidden"
            style={{ background: 'rgba(3,3,14,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px' }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 border-b border-border select-none"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-dim flex-1 text-center">
                construx.contact — compose
              </span>
              <span
                className="font-mono text-[8px] uppercase tracking-widest"
                style={{ color: form.name && form.email && form.message.length >= 20 ? 'rgba(40,200,64,0.6)' : 'rgba(255,255,255,0.15)' }}
              >
                {form.name && form.email && form.message.length >= 20 ? 'READY' : 'DRAFT'}
              </span>
            </div>
            {/* Shell prompt */}
            <div
              className="px-4 py-1.5 border-b border-border select-none"
              style={{ background: 'rgba(255,255,255,0.01)' }}
            >
              <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
                construx@sys:~$
              </span>
              <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>
                construx contact --compose
              </span>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {field('name', 'Your name', 'text', 'Your name')}
                {field('email', 'Email address', 'email', 'you@company.com')}
              </div>

              {/* Topic dropdown */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="topic"
                  className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-text-dim"
                >
                  Topic <span className="normal-case tracking-normal opacity-60">(optional)</span>
                </label>
                <select
                  id="topic"
                  value={form.topic}
                  onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  className="w-full px-4 py-3 text-sm transition-all outline-none focus:border-construx/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] appearance-none"
                  style={{
                    background: 'rgba(5,5,18,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '2px',
                    color: form.topic ? '#F0EFFF' : 'rgba(240,239,255,0.35)',
                  }}
                >
                  <option value="" disabled>
                    Select a topic…
                  </option>
                  {topics.map((t) => (
                    <option key={t} value={t} style={{ background: '#05050F', color: '#F0EFFF' }}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="message"
                    className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-text-dim"
                  >
                    Message
                  </label>
                  <span
                    className="font-mono text-[9px] tabular-nums uppercase tracking-widest"
                    style={{ color: form.message.length < 20 ? 'rgba(240,239,255,0.2)' : 'rgba(249,115,22,0.5)' }}
                  >
                    {String(form.message.length).padStart(4, '0')} CHR
                  </span>
                </div>
                <textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us what you're working on or want to build…"
                  className="w-full px-4 py-3 text-sm text-text-base placeholder:text-text-dim resize-none transition-all outline-none focus:border-construx/50 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]"
                  style={{
                    background: 'rgba(5,5,18,0.8)',
                    border: errors.message ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '2px',
                  }}
                />
                {errors.message && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.message}
                  </p>
                )}
              </div>

              {status === 'error' && (
                <div
                  className="flex items-start gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-red-400"
                  style={{ borderRadius: '2px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Something went wrong. Try again or{' '}
                    <a
                      href="mailto:lewis.oliver.wilson@googlemail.com"
                      className="underline underline-offset-2 hover:text-red-300 transition-colors normal-case"
                    >
                      email us directly
                    </a>
                    .
                  </span>
                </div>
              )}
            </div>

            {/* Footer bar */}
            <div
              className="px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border"
              style={{ background: 'rgba(0,0,8,0.4)' }}
            >
              <p className="font-mono text-[10px] text-text-dim">
                <span className="text-construx">// </span>
                <a
                  href="mailto:lewis.oliver.wilson@googlemail.com"
                  className="text-text-muted hover:text-construx transition-colors"
                >
                  lewis.oliver.wilson@googlemail.com
                </a>
              </p>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center gap-2 px-6 py-2.5 font-mono text-xs font-semibold text-black bg-construx hover:bg-orange-400 transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)] hover:shadow-[0_0_24px_rgba(249,115,22,0.5)] disabled:opacity-60 disabled:pointer-events-none uppercase tracking-wider"
                style={{ borderRadius: '3px' }}
              >
                {status === 'loading' ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={13} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Latency map */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <LatencyMapPanel />
      </section>

      {/* Traceroute */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <TraceroutePanel />
      </section>

      {/* WHOIS domain info */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <WhoisPanel />
      </section>

      {/* SSL certificate info */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <SslCertPanel />
      </section>

      {/* DNS lookup */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <DnsLookupPanel />
      </section>

      {/* HTTP benchmark */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <HttpBenchPanel />
      </section>

      {/* Email auth records */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <SpfDkimPanel />
      </section>

      {/* TLS handshake */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <TlsHandshakePanel />
      </section>

      {/* MTR route analysis */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <MtrPanel />
      </section>

      {/* Security headers audit */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <SecurityHeadersPanel />
      </section>

      {/* Packet capture */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <TsharkPacketPanel />
      </section>

      {/* Caddy access log */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <CaddyAccessPanel />
      </section>

      {/* TLS certificate info */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <CertInfoPanel />
      </section>

      {/* gRPC service reflection + call */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <GrpcCallPanel />
      </section>

      {/* PostgreSQL streaming replication */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <PostgresReplPanel />
      </section>

      {/* WASM component model */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <WasmComponentPanel />
      </section>

      {/* BGP routing table */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <BgpLookupPanel />
      </section>

      {/* curl -v TLS handshake + response timing */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <CurlVerbosePanel />
      </section>

      {/* dig DNS record lookup */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <DigPanel />
      </section>

      {/* step certificate issuance and rotation */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <StepCliPanel />
      </section>

      {/* crossplane cloud infrastructure as Kubernetes CRDs */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <CrossplanePanel />
      </section>

      {/* redpanda kafka-compatible streaming — no JVM, raft built in */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <RedpandaPanel />
      </section>

      {/* cockroachdb distributed sql — raft replication, serializable isolation */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <CockroachDbPanel />
      </section>

      {/* citus distributed postgresql — sharding, co-location, scatter-gather */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <CitusPanel />
      </section>

      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <EtcdPanel />
      </section>

      {/* tekton cloud-native ci/cd — tasks, pipelines, chains, cosign attestation */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <TektonPanel />
      </section>

      {/* external-dns kubernetes-driven dns — route53, ingress, service, txt-ownership */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <ExternalDnsPanel />
      </section>

      {/* kubescape kspm — nsa/mitre/cis compliance, control checks, risk score */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <KubescapePanel />
      </section>

      {/* apache iceberg open table format — snapshots, schema evolution, manifests */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <IcebergPanel />
      </section>

      {/* wasmedge wasi runtime — wasm modules, wasi proposals, edge compute */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <WasmEdgePanel />
      </section>

      {/* bazel hermetic build — remote cache, targets, action cache stats */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <BazelPanel />
      </section>

      {/* clickhouse columnar olap — mergetree tables, insert rate, query results */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <ClickhouseMigrationPanel />
      </section>

      {/* temporal durable workflow engine — workflows, activities, task queues */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <TemporalPanel />
      </section>

      {/* teleport zero-trust infra access — nodes, audit log, mTLS */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <TeleportPanel />
      </section>

      {/* portainer container management — environments, docker/k8s, live stats */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <PortainerPanel />
      </section>

      {/* airbyte open-source elt — connectors, syncs, records moved */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <AirbytePanel />
      </section>

      {/* kubernetes gateway api — httproutes, listeners, backends */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <KubernetesGatewayPanel />
      </section>

      {/* crunchy postgres operator — ha clusters, pgbackrest, replication */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <CrunchyPostgresPanel />
      </section>

      {/* gatling load testing — simulations, rps, percentiles */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <GatlingPanel />
      </section>

      {/* k6 performance testing — scenarios, thresholds, executors */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <K6Panel />
      </section>

      {/* litestream sqlite replication — wal, s3, snapshots */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <LitestreamPanel />
      </section>

      {/* benthos stream processor — pipelines, bloblang, fanout */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <BenthosPanel />
      </section>

      {/* consul service mesh — discovery, intentions, health */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <ConsulPanel />
      </section>

      {/* patroni ha postgresql — leader, replicas, failover */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <PatroniPanel />
      </section>

      {/* minio s3-compatible object store — buckets, objects, ops */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <MinIOPanel />
      </section>

      {/* vault secrets management — engines, policies, audit */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <VaultPanel />
      </section>

      {/* caddy web server — routes, automatic-tls, reverse-proxy */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <CaddyPanel />
      </section>

      {/* istio service mesh — virtual services, destination rules, mtls */}
      <section className="px-5 pb-6 mx-auto max-w-2xl">
        <IstioPanel />
      </section>

      {/* opa open policy agent — rego, bundles, decisions */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <OPAPanel />
      </section>

      {/* fluent bit log processor — inputs, filters, outputs */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <FluentBitPanel />
      </section>

      {/* alertmanager prometheus alerts — groups, silences, receivers */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <AlertManagerPanel />
      </section>

      {/* neon serverless postgres — branches, connections, compute */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <NeonPanel />
      </section>

      {/* ollama local llm — models, sessions, inference */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <OllamaPanel />
      </section>

      {/* grpcurl grpc client — services, methods, responses */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <GrpcurlPanel />
      </section>

      {/* nmap network scan — hosts, ports, services */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <NmapScanPanel />
      </section>

      {/* spire workload identity — agents, entries, svids */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <SpirePanel />
      </section>

      {/* dapr distributed application runtime — actors, pub/sub, state */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <DaprPanel />
      </section>

      {/* cilium ebpf networking — endpoints, policy, hubble flows */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <CiliumPanel />
      </section>

      {/* nats jetstream — streams, consumers, messages, acks */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <NATSJetStreamPanel />
      </section>

      {/* airflow dag orchestration — celery, sensors, xcom, dynamic tasks */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <AirflowPanel />
      </section>

      {/* flink stateful stream processing — exactly-once, windows, checkpoints */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <FlinkPanel />
      </section>

      {/* goreleaser — release automation, binaries, docker, changelog */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <GoReleaserPanel />
      </section>

      {/* kafka connect — connectors, tasks, offsets, sink source */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <KafkaConnectPanel />
      </section>

      {/* argo cd — gitops, sync, apps, rollbacks */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <ArgoCDPanel />
      </section>

      {/* brew list — installed formulae, casks, versions */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <BrewListPanel />
      </section>

      {/* cosign — container signing, verification, keyless */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <CosignPanel />
      </section>

      {/* druid — real-time analytics, datasources, segments */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <DruidPanel />
      </section>

      {/* envoy stats — downstream, upstream, listener metrics */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <EnvoyStatsPanel />
      </section>

      {/* git config — user, remote, branch, protocol settings */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <GitConfigPanel />
      </section>

      {/* http archive — requests, timings, headers, responses */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <HttpArchivePanel />
      </section>

      {/* k3s — lightweight kubernetes, agents, storage, networking */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <K3sPanel />
      </section>

      {/* kafka streams — topologies, tasks, state stores, lag */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <KafkaStreamsPanel />
      </section>

      {/* kubectl logs — pod logs, follow, timestamps, containers */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <KubectlLogsPanel />
      </section>

      {/* kyverno — policy engine, mutations, validations, generates */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <KyvernoPanel />
      </section>

      {/* lshw — hardware list, buses, memory, cpus, disks */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <LshwPanel />
      </section>

      {/* aws cli — s3, ec2, iam, lambda commands */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <AwsCliPanel />
      </section>

      {/* act — github actions local runner, jobs, steps, env */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <ActPanel />
      </section>

      {/* cpu stats — cores, freq, load, iowait, steal */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <CpuStatsPanel />
      </section>

      {/* gitea — repos, issues, prs, stars */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <GiteaPanel />
      </section>

      {/* neofetch — os, kernel, cpu, mem, uptime */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <NeofetchPanel />
      </section>

      {/* nix shell — packages, derivations, env, flake */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <NixShellPanel />
      </section>

      {/* oauth flow — authorize, token, introspect, revoke */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <OAuthFlowPanel />
      </section>

      {/* openssl — cert, key, csr, chain, verify */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <OpensslPanel />
      </section>

      {/* pgvector — embeddings, index, similarity, dimensions */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <PgvectorPanel />
      </section>

      {/* prometheus metrics — labels, samples, cardinality, scrape */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <PrometheusMetricsPanel />
      </section>

      {/* renovate — deps, updates, prs, merge confidence */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <RenovatePanel />
      </section>

      {/* sbom — components, licenses, vulnerabilities, cpe */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <SbomPanel />
      </section>

      {/* ip link — interfaces, mtu, state, mac, flags */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <IpLinkPanel />
      </section>

      {/* sigstore — keyless signing, cosign, rekor, transparency log */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <SigstorePanel />
      </section>

      {/* spicedb — zanzibar authz, schema, tuples, checks */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <SpiceDBPanel />
      </section>

      {/* strimzi — kafka on k8s, topics, brokers, kraft, mtls */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <StrimziPanel />
      </section>

      {/* trivy scan — container images, os packages, cve severity */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <TrivyScanPanel />
      </section>

      {/* tigerbeetle — financial ledger, double-entry, fault-tolerant */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <TigerBeetlePanel />
      </section>

      {/* tech freq — language frequency, lines, commits, contributors */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <TechFreqPanel />
      </section>

      {/* terraform — providers, resources, state, plan, apply */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <TerraformPanel />
      </section>

      {/* uptime — system uptime, load average, users, processes */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <UptimePanel />
      </section>

      {/* ansible playbook — tasks, hosts, roles, handlers, inventory */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <AnsiblePlaybookPanel />
      </section>

      {/* argo events — event-driven workflows, event sources, sensors, triggers */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <ArgoEventsPanel />
      </section>

      {/* argo rollout — progressive delivery, canary, bluegreen, analysis */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <ArgoRolloutPanel />
      </section>

      {/* argo workflows — dag pipelines, ml training, artifacts, parallel steps */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <ArgoWorkflowsPanel />
      </section>

      {/* atlas database schema management — migrations, drift, ci */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <AtlasPanel />
      </section>

      {/* auditd linux audit framework — syscalls, events, rules, trails */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <AuditdPanel />
      </section>

      {/* authentik identity provider — sso, oauth2, saml, audit */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <AuthentikPanel />
      </section>

      {/* aws bedrock — foundation models, inference, agents */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <AwsBedrockPanel />
      </section>

      {/* backstage developer portal — catalog, tech radar, plugins */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <BackstagePanel />
      </section>

      {/* beyla ebpf auto-instrumentation — spans, latency, red metrics */}
      <section className="px-5 pb-14 mx-auto max-w-2xl">
        <BeylaPanel />
      </section>

      {/* biome js toolchain — lint, format, check, ci */}
      <section className="px-5 pb-20 mx-auto max-w-2xl">
        <BiomePanel />
      </section>
    </div>
  );
}
