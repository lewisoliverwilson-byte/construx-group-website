'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'authed' | 'session' | 'brokered' | 'audit' | 'warn' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# boundary: identity-based access to infrastructure — no static credentials' },
  { kind: 'prompt',   text: 'boundary authenticate oidc --auth-method-id amoidc_1234567890' },
  { kind: 'authed',   text: '  Authentication information:' },
  { kind: 'authed',   text: '    Account ID:   acctoidc_1234567890 (lewis.wilson@construx.io)' },
  { kind: 'authed',   text: '    Token Expires: 2033-01-07T11:00:00Z (8h)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# list targets you have access to' },
  { kind: 'prompt',   text: 'boundary targets list -scope-id global -recursive' },
  { kind: 'session',  text: '  tssh_1234567890   api-01-ssh       SSH  construx-prod  eu-west-1a' },
  { kind: 'session',  text: '  ttcp_0987654321   postgres-primary  TCP  construx-prod  5432' },
  { kind: 'session',  text: '  ttcp_5678901234   redis-cluster     TCP  construx-prod  6379' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# connect to SSH target — Boundary brokers the session' },
  { kind: 'prompt',   text: 'boundary connect ssh --target-id tssh_1234567890 -- -l ubuntu' },
  { kind: 'brokered', text: '  ✓  Vault issued SSH certificate (30m TTL, key: ed25519)' },
  { kind: 'brokered', text: '  ✓  Session authorized  s_1234567890' },
  { kind: 'brokered', text: '  ✓  Proxying SSH → 10.0.1.10:22 via worker prod-eu-01' },
  { kind: 'stat',     text: '  ubuntu@ip-10-0-1-10:~$ ' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# audit: every session is recorded' },
  { kind: 'prompt',   text: 'boundary sessions list -scope-id global -recursive' },
  { kind: 'audit',    text: '  s_1234567890  tssh  lewis.wilson  10.0.1.10:22  terminated  14m22s' },
  { kind: 'audit',    text: '  s_0987654321  ttcp  data.team     postgres:5432  active      2m11s' },
  { kind: 'stat',     text: '  2 sessions total  1 active  1 terminated' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'authed':   return '#4ade80';
    case 'session':  return '#67e8f9';
    case 'brokered': return '#a78bfa';
    case 'audit':    return '#fbbf24';
    case 'warn':     return '#f87171';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function BoundaryPanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveSessions,  setLiveSessions]  = useState(2);
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
            setLiveSessions(Math.floor(1 + Math.random() * 4));
          }, 2100);
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
          construx@prod-01 — boundary · zero-trust infrastructure access
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveSessions} sessions` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          boundary · OIDC · SSH · TCP · Vault · session brokering · audit
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Boundary v0.17 ·</span>
          <span style={{ color: '#4ade80' }}>OIDC authed</span>
          <span style={{ color: '#a78bfa' }}>Vault injected</span>
          <span style={{ color: '#fbbf24' }}>{liveSessions} sessions</span>
          <span style={{ color: '#67e8f9' }}>full audit log</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          boundary · zero-trust · OIDC · Vault · SSH · TCP · audit · PAM
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● brokering' : 'loading'}
        </span>
      </div>
    </div>
  );
}
