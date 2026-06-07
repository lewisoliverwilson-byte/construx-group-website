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
      <section className="px-5 pb-20 mx-auto max-w-2xl">
        <BazelPanel />
      </section>
    </div>
  );
}
