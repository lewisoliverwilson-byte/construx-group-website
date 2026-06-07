'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'endpoint-ok' | 'endpoint-warn' | 'policy' | 'flow-allow' | 'flow-deny' | 'metric' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',      text: '# Cilium endpoint status — one endpoint per pod' },
  { kind: 'prompt',       text: 'cilium endpoint list' },
  { kind: 'endpoint-ok',  text: 'ENDPOINT  POLICY (ingress)  POLICY (egress)  IDENTITY   LABELS                   STATUS' },
  { kind: 'endpoint-ok',  text: '1842      Enabled           Enabled          34291      k8s:app=construx-api     ready' },
  { kind: 'endpoint-ok',  text: '1843      Enabled           Enabled          34291      k8s:app=construx-api     ready' },
  { kind: 'endpoint-ok',  text: '2104      Enabled           Enabled          28183      k8s:app=construx-worker  ready' },
  { kind: 'endpoint-ok',  text: '2891      Enabled           Enabled          14842      k8s:app=postgres         ready' },
  { kind: 'endpoint-warn', text: '3012      Enabled           Disabled         92841      k8s:app=legacy-importer  not-ready' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Cilium network policy — identity-based L3/L4/L7 enforcement' },
  { kind: 'prompt',       text: 'cilium policy get' },
  { kind: 'policy',       text: '  Revision: 48   Labels: [k8s:io.cilium.k8s.policy.name=allow-api-to-postgres]' },
  { kind: 'policy',       text: '  Ingress: fromEndpoints[k8s:app=construx-api] → postgres:5432/TCP  → Allow' },
  { kind: 'policy',       text: '  Ingress: fromEndpoints[k8s:app=construx-worker] → postgres:5432/TCP → Allow' },
  { kind: 'policy',       text: '  Egress:  default → Deny (zero-trust: deny unless explicitly allowed)' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Hubble — eBPF-native flow visibility (Cilium\'s observability layer)' },
  { kind: 'prompt',       text: 'hubble observe --namespace construx --follow' },
  { kind: 'flow-allow',   text: 'Mar 25 14:32:01.441  FORWARDED  construx-api-6d9f/construx → postgres-0/construx  TCP 34291→14842  :5432' },
  { kind: 'flow-allow',   text: 'Mar 25 14:32:01.444  FORWARDED  construx-api-6d9f/construx → nats-0/construx      TCP 34291→19823  :4222' },
  { kind: 'flow-deny',    text: 'Mar 25 14:32:01.512  DROPPED    legacy-importer/construx  → postgres-0/construx  TCP 92841→14842  :5432 (policy deny)' },
  { kind: 'flow-allow',   text: 'Mar 25 14:32:02.003  FORWARDED  construx-worker/construx  → postgres-0/construx  TCP 28183→14842  :5432' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Cilium metrics — dataplane statistics' },
  { kind: 'prompt',       text: 'cilium metrics list | grep -E "forward|drop|policy"' },
  { kind: 'metric',       text: 'cilium_drop_count_total{reason="Policy denied"}         8,421' },
  { kind: 'metric',       text: 'cilium_forward_count_total{direction="ingress"}      4,928,312' },
  { kind: 'metric',       text: 'cilium_forward_count_total{direction="egress"}       4,901,847' },
  { kind: 'metric',       text: 'cilium_policy_count                                         12' },
  { kind: 'metric',       text: 'cilium_policy_endpoint_enforcement_status{status="true"}    31' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':       return 'rgba(240,239,255,0.22)';
    case 'prompt':        return 'rgba(240,239,255,0.6)';
    case 'endpoint-ok':   return '#4ade80';
    case 'endpoint-warn': return '#fbbf24';
    case 'policy':        return '#a78bfa';
    case 'flow-allow':    return '#67e8f9';
    case 'flow-deny':     return '#f87171';
    case 'metric':        return '#fb923c';
    default:              return 'transparent';
  }
}

export default function CiliumPanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [liveForward,  setLiveForward]  = useState(4928312);
  const [liveDrop,     setLiveDrop]     = useState(8421);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveForward((v) => v + Math.floor(Math.random() * 800));
            setLiveDrop((v) => v + Math.floor(Math.random() * 3));
          }, 1950);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 81;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, revealed - 1));

  return (
    <div
      ref={ref}
      className="overflow-x-auto font-mono"
      style={{
        background:   'rgba(1,1,10,0.97)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow:    '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px rgba(255,95,87,0.4)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px rgba(255,189,46,0.3)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 4px rgba(40,200,64,0.3)' }} />
        </div>
        <span
          className="flex-1 text-center text-[9px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          construx@k8s-node-01 — cilium · Hubble · eBPF network policy
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveForward.toLocaleString()} fwd` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@k8s-node-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cilium endpoint · policy · hubble flows · eBPF dataplane
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => (
          <div
            key={i}
            className="text-[7.5px] leading-[1.8]"
            style={{ color: lineColor(l.kind) }}
          >
            {l.kind === 'blank' ? ' ' : (
              <>
                {l.kind === 'prompt' && (
                  <span style={{ color: 'rgba(74,222,128,0.45)', marginRight: '6px' }}>$</span>
                )}
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Cilium 1.16 · eBPF ·</span>
          <span style={{ color: '#4ade80' }}>{liveForward.toLocaleString()} forwarded</span>
          <span style={{ color: '#f87171' }}>{liveDrop.toLocaleString()} dropped</span>
          <span style={{ color: '#a78bfa' }}>12 policies active</span>
          <span style={{ color: '#67e8f9' }}>Hubble relay: enabled</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          Cilium 1.16.2 · Hubble 0.13 · eBPF kernel 6.8 · zero-trust L3/L4/L7
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● enforcing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
