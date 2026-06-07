import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';
import GitShortlogPanel from '@/components/GitShortlogPanel';
import WhoamiPanel from '@/components/WhoamiPanel';
import GpgFingerprintPanel from '@/components/GpgFingerprintPanel';
import IpAddrPanel from '@/components/IpAddrPanel';
import LastLoginPanel from '@/components/LastLoginPanel';
import UlimitPanel from '@/components/UlimitPanel';
import VarLogAuthPanel from '@/components/VarLogAuthPanel';
import SshAuditPanel from '@/components/SshAuditPanel';
import CurlJwtPanel from '@/components/CurlJwtPanel';
import AuditdPanel from '@/components/AuditdPanel';
import DockerBuildPanel from '@/components/DockerBuildPanel';
import PnpmWorkspacePanel from '@/components/PnpmWorkspacePanel';
import DockerComposePanel from '@/components/DockerComposePanel';
import GitSignPanel from '@/components/GitSignPanel';
import EbpfTracePanel from '@/components/EbpfTracePanel';
import CgroupsPanel from '@/components/CgroupsPanel';
import ArgoCdPanel from '@/components/ArgoCdPanel';
import JournaldPanel from '@/components/JournaldPanel';
import HyperfinePanel from '@/components/HyperfinePanel';
import OpaPanel from '@/components/OpaPanel';
import TrivyPanel from '@/components/TrivyPanel';
import ClickHousePanel from '@/components/ClickHousePanel';
import RisingWavePanel from '@/components/RisingWavePanel';
import DbtPanel from '@/components/DbtPanel';
import CertManagerPanel from '@/components/CertManagerPanel';
import ClusterApiPanel from '@/components/ClusterApiPanel';
import PinotPanel from '@/components/PinotPanel';
import BackstagePanel from '@/components/BackstagePanel';
import ChaosMeshPanel from '@/components/ChaosMeshPanel';
import CniPanel from '@/components/CniPanel';
import TerraformCloudPanel from '@/components/TerraformCloudPanel';
import CaddyPanel from '@/components/CaddyPanel';
import ArgoEventsPanel from '@/components/ArgoEventsPanel';
import TankaPanel from '@/components/TankaPanel';
import FlaggerPanel from '@/components/FlaggerPanel';
import GrafanaFaroPanel from '@/components/GrafanaFaroPanel';

export const metadata: Metadata = {
  title: 'Founders',
  description:
    'Lewis Wilson and Dan — the two people behind Construx Group. How they met, why they started building, and how the group operates.',
};

const founders = [
  {
    name: 'Lewis Wilson',
    handle: 'LW',
    role: 'Co-founder',
    bio: `Builder and product architect. Leads the technical direction for every venture in the portfolio — from architecture decisions to the prompt engineering that sits at the core of each product.\n\nCame up in full-stack web development before AI made it interesting to build in a completely different way. Now spends most of his time proving that a two-person team with the right tools can build what previously took ten.`,
    focus: ['Product strategy', 'Technical architecture', 'AI integration', 'Venture direction'],
    accent: '#F97316',
    stats: [
      { label: 'VENTURES', value: '003' },
      { label: 'BUILDS', value: '1k+' },
      { label: 'STACK', value: 'TS / Next.js' },
    ],
  },
  {
    name: 'Dan',
    handle: 'DAN',
    role: 'Co-founder',
    bio: `Operator and creative director. Turns half-formed ideas into something real, and real things into something people actually want to use.\n\nHandles the side of building that isn't code — the go-to-market framing, the product design decisions, the user experience decisions that determine whether a technically excellent product gets used or ignored.`,
    focus: ['Design', 'Operations', 'Product direction', 'Growth'],
    accent: '#8B5CF6',
    stats: [
      { label: 'VENTURES', value: '003' },
      { label: 'DESIGNS', value: '12+' },
      { label: 'DOMAIN', value: 'GTM / UX' },
    ],
  },
];

const foundersSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Founders — Construx Group',
  url: 'https://construxgroup.io/founders',
  mainEntity: founders.map((f) => ({
    '@type': 'Person',
    name: f.name,
    jobTitle: f.role,
    worksFor: { '@type': 'Organization', name: 'Construx Group', url: 'https://construxgroup.io' },
  })),
};

function pad(n: string, len: number) {
  return String(n).padEnd(len, ' ');
}

export default function FoundersPage() {
  const allPosts = getAllPostMeta();

  const now = new Date();
  const launchDate = new Date('2026-03-01');
  const tenure = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(foundersSchema) }}
      />
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-5 animate-fade-in">
            // THE PEOPLE
          </p>
          <h1
            className="text-display text-text-base mb-6 leading-none animate-fade-up"
            style={{ animationDelay: '90ms', animationFillMode: 'both' }}
          >
            The <span className="text-gradient-orange">Founders</span>
          </h1>
          <p
            className="text-text-muted text-base leading-relaxed max-w-lg mx-auto animate-fade-up"
            style={{ animationDelay: '220ms', animationFillMode: 'both' }}
          >
            Two people. Equal billing. Everything built, owned, and shipped together.
          </p>
        </div>
      </section>

      {/* Founder cards */}
      <section className="px-5 py-20 mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {founders.map((f) => (
            <article
              key={f.name}
              className="overflow-hidden"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${f.accent}20`,
                boxShadow: `0 0 40px ${f.accent}06`,
                borderRadius: '3px',
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0 select-none"
                style={{ borderBottom: `1px solid ${f.accent}18`, background: `${f.accent}06` }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span
                  className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center truncate"
                  style={{ color: `${f.accent}60` }}
                >
                  construx.{f.handle.toLowerCase()} — {f.role.toLowerCase()}
                </span>
                <span
                  className="font-mono text-[8px] uppercase tracking-widest"
                  style={{ color: 'rgba(74,222,128,0.5)' }}
                >
                  ● ONLINE
                </span>
              </div>

              {/* Shell prompt */}
              <div
                className="px-4 py-1.5 select-none"
                style={{ borderBottom: `1px solid ${f.accent}12`, background: 'rgba(255,255,255,0.01)' }}
              >
                <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
                  construx@sys:~$
                </span>
                <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>
                  {`cat /var/construx/founders/${f.handle.toLowerCase()}.json`}
                </span>
              </div>

              <div className="p-8">
                {/* ID panel */}
                <div
                  className="mb-7 overflow-hidden"
                  style={{
                    background: 'rgba(0,0,6,0.7)',
                    border: `1px solid ${f.accent}18`,
                    borderRadius: '3px',
                    fontFamily: 'var(--font-jetbrains-mono)',
                  }}
                >
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2.5 select-none" style={{ borderBottom: `1px solid ${f.accent}10` }}>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
                    </div>
                    <p
                      className="text-[9px] font-medium uppercase tracking-[0.25em]"
                      style={{ color: `${f.accent}70` }}
                    >
                      id.profile
                    </p>
                  </div>
                  {/* Shell prompt */}
                  <div className="px-4 py-1 select-none" style={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, background: 'rgba(255,255,255,0.01)' }}>
                    <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
                    <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{`cat /var/construx/founders/${f.handle.toLowerCase()}.json | jq '.profile'`}</span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    {[
                      ['USER', f.handle],
                      ['STATUS', '● ONLINE'],
                      ['ROLE', f.role.toUpperCase()],
                      ['TENURE', `${String(tenure).padStart(3, '0')}D`],
                      ['DISPATCHES', String(allPosts.length).padStart(3, '0')],
                      ...f.stats.map((s) => [s.label, s.value]),
                    ].map(([key, val]) => (
                      <p key={key} className="text-[9px] flex items-center">
                        <span style={{ color: 'rgba(255,255,255,0.22)', minWidth: '90px' }}>
                          {pad(key, 12)}
                        </span>
                        <span
                          style={{
                            color:
                              val === '● ONLINE'
                                ? '#4ade80'
                                : 'rgba(240,239,255,0.65)',
                          }}
                        >
                          {val}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Name + role */}
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-base mb-1">{f.name}</h2>
                    <p className="text-sm font-medium" style={{ color: f.accent }}>
                      {f.role}, Construx Group
                    </p>
                  </div>
                  {/* Pulsing status dot */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full animate-glow-pulse"
                      style={{ background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.8)' }}
                    />
                    <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#4ade80' }}>
                      Online
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-3 mb-7">
                  {f.bio.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-text-muted leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Focus areas */}
                <div>
                  <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-text-dim mb-3">
                    // FOCUS AREAS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {f.focus.map((area) => (
                      <span
                        key={area}
                        className="font-mono text-[9px] font-medium px-2.5 py-1 uppercase tracking-wider"
                        style={{
                          background: `${f.accent}10`,
                          border: `1px solid ${f.accent}20`,
                          color: f.accent,
                          borderRadius: '2px',
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Status footer */}
              <div
                className="flex items-center justify-between px-4 py-1.5 select-none"
                style={{ borderTop: `1px solid ${f.accent}12`, background: 'rgba(0,0,0,0.25)' }}
              >
                <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: `${f.accent}35` }}>
                  {f.handle.toLowerCase()}.profile
                </span>
                <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.35)' }}>● online</span>
              </div>
            </article>
          ))}
        </div>

        {/* Auth log panel */}
        <div
          className="mt-16 overflow-hidden font-mono"
          style={{
            background: 'rgba(1,1,10,0.95)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '3px',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 3px rgba(255,95,87,0.4)' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 3px rgba(255,189,46,0.3)' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 3px rgba(40,200,64,0.3)' }} />
            </div>
            <span className="text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              construx@sys — auth.log — who is online
            </span>
            <span className="text-[8px] flex items-center gap-1.5" style={{ color: 'rgba(74,222,128,0.5)' }}>
              <span className="inline-block w-1 h-1 rounded-full status-blink" style={{ background: '#4ade80' }} />
              2 ONLINE
            </span>
          </div>
          {/* Shell prompt */}
          <div
            className="px-4 py-1.5 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
          >
            <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
            <span className="text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>
              {`w --short && tail -n 6 /var/log/auth.log | grep "Accepted"`}
            </span>
          </div>
          {/* w output */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-3 mb-1">
              {[['USER', '10ch'], ['TTY', '6ch'], ['FROM', '18ch'], ['LOGIN@', '8ch'], ['IDLE', '5ch'], ['WHAT', 'auto']].map(([h]) => (
                <span key={h} className="text-[8px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.18)', minWidth: h === 'WHAT' ? 'auto' : undefined }}>{h}</span>
              ))}
            </div>
            {[
              { user: 'lewis', tty: 'pts/0', from: '185.199.108.153', login: '09:14', idle: '0:00', what: 'construx build --venture=scoutr' },
              { user: 'dan',   tty: 'pts/1', from: '203.0.113.42',    login: '09:31', idle: '2:14', what: 'figma-bridge --sync --target=thehyve' },
            ].map((row) => (
              <div key={row.user} className="flex items-center gap-3">
                <span className="text-[9px] tabular-nums" style={{ color: '#F97316', minWidth: '10ch' }}>{row.user}</span>
                <span className="text-[9px] tabular-nums" style={{ color: 'rgba(255,255,255,0.25)', minWidth: '6ch' }}>{row.tty}</span>
                <span className="text-[9px] tabular-nums" style={{ color: 'rgba(103,232,249,0.6)', minWidth: '18ch' }}>{row.from}</span>
                <span className="text-[9px] tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', minWidth: '8ch' }}>{row.login}</span>
                <span className="text-[9px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '5ch' }}>{row.idle}</span>
                <span className="text-[9px]" style={{ color: 'rgba(240,239,255,0.4)' }}>{row.what}</span>
              </div>
            ))}
          </div>
          {/* Auth log entries */}
          <div className="px-4 py-3">
            {[
              { ts: `${new Date().toISOString().slice(0, 10)} 09:14:02`, msg: 'Accepted publickey for lewis from 185.199.108.153 port 52341 ssh2', color: 'rgba(74,222,128,0.6)' },
              { ts: `${new Date().toISOString().slice(0, 10)} 09:31:17`, msg: 'Accepted publickey for dan from 203.0.113.42 port 49112 ssh2', color: 'rgba(74,222,128,0.6)' },
              { ts: `${new Date().toISOString().slice(0, 10)} 08:00:01`, msg: 'pam_unix(sshd:session): session opened for user construx by (uid=0)', color: 'rgba(255,255,255,0.2)' },
              { ts: `${new Date().toISOString().slice(0, 10)} 07:59:58`, msg: 'Accepted publickey for construx from 127.0.0.1 port 22 ssh2 — runtime boot', color: 'rgba(255,255,255,0.2)' },
            ].map((line, i) => (
              <div key={i} className="flex items-baseline gap-3 mb-0.5">
                <span className="text-[8px] tabular-nums flex-shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }}>{line.ts}</span>
                <span className="text-[8px]" style={{ color: line.color }}>{line.msg}</span>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div
            className="flex items-center justify-between px-4 py-1.5 select-none"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
          >
            <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
              auth.log · uptime {tenure}d
            </span>
            <span className="text-[8px]" style={{ color: 'rgba(74,222,128,0.3)' }}>construx@sys</span>
          </div>
        </div>

        {/* Origin story */}
        <div
          className="mt-8 overflow-hidden"
          style={{
            background: 'rgba(5,5,18,0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '3px',
          }}
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
              construx.origin — how we started
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
            <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>
              cat /var/construx/origin.log
            </span>
          </div>
          <div className="p-10">
          <h2 className="text-heading-xl text-text-base mb-6">How Construx started</h2>
          <p className="text-text-muted leading-relaxed text-base mb-4">
            Construx started from a simple observation: the tools had changed enough that a small,
            disciplined team could build and ship things that previously required significant
            headcount, funding, and time. The question wasn't whether AI could help — it was
            whether you could organise a company entirely around that assumption from day one.
          </p>
          <p className="text-text-muted leading-relaxed text-base mb-4">
            The first test was{' '}
            <Link
              href="/ventures/scoutr"
              className="text-construx hover:text-orange-400 underline underline-offset-2 decoration-construx/40 transition-colors"
            >
              Scoutr
            </Link>{' '}
            — a resell intelligence product built in three weeks, live in production, with real users
            before most startups have finished their pitch deck. That worked. So we kept going.{' '}
            <Link
              href="/ventures/the-marqet"
              className="text-construx hover:text-orange-400 underline underline-offset-2 decoration-construx/40 transition-colors"
            >
              The Marqet
            </Link>{' '}
            followed. Then{' '}
            <Link
              href="/ventures/the-hyve"
              className="text-construx hover:text-orange-400 underline underline-offset-2 decoration-construx/40 transition-colors"
            >
              The Hyve
            </Link>
            . Each venture was proof that the model held at the next level of complexity.
          </p>
          <p className="text-text-muted leading-relaxed text-base">
            Every product in the portfolio is something that wouldn't exist in its current form
            without Claude as a core collaborator — not a shortcut, but a genuine building tool.
            The result is a small group that operates like something much larger, without
            compromising on quality or pace.
          </p>
          </div>
          {/* Status footer */}
          <div
            className="flex items-center justify-between px-4 py-1.5 select-none"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}
          >
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
              construx.origin
            </span>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>exit: 0</span>
          </div>
        </div>

        {/* Contribution stats */}
        <div className="mt-8">
          <GitShortlogPanel />
        </div>

        {/* Identity panel */}
        <div className="mt-6">
          <WhoamiPanel />
        </div>

        {/* GPG key fingerprints */}
        <div className="mt-6">
          <GpgFingerprintPanel />
        </div>

        {/* Network interfaces */}
        <div className="mt-6">
          <IpAddrPanel />
        </div>

        {/* Login history */}
        <div className="mt-6">
          <LastLoginPanel />
        </div>

        {/* Resource limits */}
        <div className="mt-6">
          <UlimitPanel />
        </div>

        {/* Auth log */}
        <div className="mt-6">
          <VarLogAuthPanel />
        </div>

        {/* SSH audit */}
        <div className="mt-6 pb-6">
          <SshAuditPanel />
        </div>

        {/* JWT decode */}
        <div className="mt-6 pb-6">
          <CurlJwtPanel />
        </div>

        {/* Linux audit log */}
        <div className="mt-6 pb-6">
          <AuditdPanel />
        </div>

        {/* Docker multi-stage build */}
        <div className="mt-6 pb-6">
          <DockerBuildPanel />
        </div>

        {/* pnpm workspace */}
        <div className="mt-6 pb-6">
          <PnpmWorkspacePanel />
        </div>

        {/* Docker Compose services */}
        <div className="mt-6 pb-6">
          <DockerComposePanel />
        </div>

        {/* GPG-signed commit log */}
        <div className="mt-6 pb-6">
          <GitSignPanel />
        </div>

        {/* eBPF kernel tracing */}
        <div className="mt-6 pb-6">
          <EbpfTracePanel />
        </div>

        {/* Cgroups v2 resource accounting */}
        <div className="mt-6 pb-6">
          <CgroupsPanel />
        </div>

        {/* Argo CD GitOps sync status */}
        <div className="mt-6 pb-6">
          <ArgoCdPanel />
        </div>

        {/* journald structured log inspection */}
        <div className="mt-6 pb-6">
          <JournaldPanel />
        </div>

        {/* hyperfine statistical command-line benchmarking */}
        <div className="mt-6 pb-6">
          <HyperfinePanel />
        </div>

        {/* opa policy-as-code authorization */}
        <div className="mt-6 pb-6">
          <OpaPanel />
        </div>

        {/* trivy vulnerability scanner and SBOM generation */}
        <div className="mt-6 pb-6">
          <TrivyPanel />
        </div>

        {/* clickhouse columnar analytics at scale */}
        <div className="mt-6 pb-6">
          <ClickHousePanel />
        </div>

        {/* risingwave postgresql-compatible streaming database — incremental sql over kafka */}
        <div className="mt-6 pb-6">
          <RisingWavePanel />
        </div>

        {/* dbt sql-first data transformation — models, tests, lineage dag */}
        <div className="mt-6 pb-6">
          <DbtPanel />
        </div>

        {/* cert-manager tls automation — acme, vault pki, auto-renewal, x509 */}
        <div className="mt-6 pb-6">
          <CertManagerPanel />
        </div>

        {/* cluster api declarative cluster lifecycle — capi, machines, machinedeployment, aws */}
        <div className="mt-6 pb-6">
          <ClusterApiPanel />
        </div>

        {/* apache pinot realtime olap — star-tree, upsert, hybrid, kafka ingestion */}
        <div className="mt-6 pb-6">
          <PinotPanel />
        </div>

        {/* backstage developer portal — service catalog, tech radar, plugins */}
        <div className="mt-6 pb-6">
          <BackstagePanel />
        </div>

        {/* chaos mesh chaos engineering — podchaos, networkchaos, iochaos, gameday */}
        <div className="mt-6 pb-6">
          <ChaosMeshPanel />
        </div>

        {/* cilium cni ebpf networking — interfaces, network policies, packet counters */}
        <div className="mt-6 pb-6">
          <CniPanel />
        </div>

        {/* terraform cloud remote runs — workspaces, drift detection, run history */}
        <div className="mt-6 pb-6">
          <TerraformCloudPanel />
        </div>

        {/* caddy automatic https — routes, tls certs, acme renewal */}
        <div className="mt-6 pb-6">
          <CaddyPanel />
        </div>

        {/* argo events — event-driven workflows, event sources, sensors, triggers */}
        <div className="mt-6 pb-6">
          <ArgoEventsPanel />
        </div>

        {/* tanka jsonnet k8s config — environments, drift diff, applied objects */}
        <div className="mt-6 pb-6">
          <TankaPanel />
        </div>

        {/* flagger progressive delivery — canary, bluegreen, a/b, metric analysis */}
        <div className="mt-6 pb-6">
          <FlaggerPanel />
        </div>

        {/* grafana faro frontend observability — apps, errors, web vitals, apm */}
        <div className="mt-6 pb-10">
          <GrafanaFaroPanel />
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            href="/work-with-us"
            className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            Work with us <ArrowRight size={14} />
          </Link>
          <Link
            href="/manifesto"
            className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            Read the manifesto
          </Link>
        </div>
      </section>
    </div>
  );
}
