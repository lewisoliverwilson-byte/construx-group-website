'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'cert' | 'role' | 'issue' | 'rotate' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# vault pki: internal ca — intermediate ca, roles, short-lived certs, k8s auth' },
  { kind: 'prompt',   text: 'vault list pki/issuers' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# keys: construx-intermediate-2034  construx-intermediate-2033' },
  { kind: 'cert',     text: '  construx-intermediate-2034  EC/384  TTL 87600h  status: active' },
  { kind: 'cert',     text: '  construx-intermediate-2033  EC/384  TTL 87600h  status: expired' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'vault write pki/issue/construx-internal-services common_name=orders-api.construx.internal ttl=24h' },
  { kind: 'blank',    text: '' },
  { kind: 'issue',    text: '  serial_number:  45:6b:c2:f8:9d:a3' },
  { kind: 'issue',    text: '  common_name:    orders-api.construx.internal' },
  { kind: 'issue',    text: '  not_after:      2034-01-24T08:14:22Z  (23h59m remaining)' },
  { kind: 'issue',    text: '  issuing_ca:     construx-intermediate-2034' },
  { kind: 'blank',    text: '' },
  { kind: 'role',     text: '  role: construx-internal-services  allowed: *.construx.internal  max-ttl: 24h' },
  { kind: 'rotate',   text: '  cert-manager: {LIVE} certs issued today  auto-renew: enabled  renewBefore: 8h' },
  { kind: 'metric',   text: '  active-certs: 142  expiring-24h: 0  revoked: 3  crl-size: 12KB' },
  { kind: 'stat',     text: '  vault v1.17.2  pki-engine  kubernetes-auth  intermediate-ca  ec384' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'cert':     return '#4ade80';
    case 'role':     return '#67e8f9';
    case 'issue':    return '#a78bfa';
    case 'rotate':   return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function VaultPkiPanel() {
  const [revealed,       setRevealed]       = useState(0);
  const [liveCertsToday, setLiveCertsToday] = useState(38);
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
            setLiveCertsToday((c) => c + (Math.random() > 0.5 ? 1 : 0));
          }, 3000);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 80;
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
          construx@pki — vault · intermediate-ca · issue · rotate · k8s-auth
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveCertsToday} today` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@pki# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          vault · pki · intermediate-ca · roles · issue · rotate · crl · k8s-auth
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'rotate'
            ? l.text.replace('{LIVE}', String(liveCertsToday))
            : l.text;
          return (
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
                  {text}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Vault v1.17.2 ·</span>
          <span style={{ color: '#4ade80' }}>142 active certs</span>
          <span style={{ color: '#fbbf24' }}>{liveCertsToday} issued today</span>
          <span style={{ color: '#a78bfa' }}>24h TTL</span>
          <span style={{ color: '#67e8f9' }}>0 expiring</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          vault · pki · intermediate-ca · issue · rotate · crl · k8s-auth
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● all valid' : 'loading'}
        </span>
      </div>
    </div>
  );
}
