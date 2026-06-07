'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'svid' | 'attest' | 'entry' | 'cert' | 'rotate' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# spiffe/spire: workload identity without secrets — x.509 svids, no api keys' },
  { kind: 'prompt',  text: 'spire-server entry show --spiffeID spiffe://construx.io/...' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# registered workload identities — no long-lived credentials' },
  { kind: 'entry',   text: '  spiffe://construx.io/ns/construx-prod/sa/construx-api' },
  { kind: 'entry',   text: '  spiffe://construx.io/ns/construx-prod/sa/construx-worker' },
  { kind: 'entry',   text: '  spiffe://construx.io/ns/construx-prod/sa/email-sender' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# node attestation: kubelet verifies pod SA token → issues svid' },
  { kind: 'attest',  text: '  k8s_psat attestor → construx-api-7d9f4b-xk2qr verified' },
  { kind: 'attest',  text: '  SVID issued: spiffe://construx.io/.../construx-api  TTL: 1h' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# x.509 svid: short-lived cert, auto-rotated before expiry' },
  { kind: 'cert',    text: '  Subject: spiffe://construx.io/ns/construx-prod/sa/construx-api' },
  { kind: 'cert',    text: '  NotBefore: 2033-06-21T09:00:00Z  NotAfter: 2033-06-21T10:00:00Z' },
  { kind: 'cert',    text: '  Issuer: SPIRE CA (construx.io)  — signed by Fulcio-compatible CA' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# mtls between services: both sides present svid — no secrets needed' },
  { kind: 'rotate',  text: '  09:58:30Z  SVID auto-rotated  construx-api  new expiry: 10:58:30Z' },
  { kind: 'stat',    text: '  3 workload identities  TTL: 1h  rotation: 5min before expiry  0 manual secrets' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'svid':    return '#4ade80';
    case 'attest':  return '#67e8f9';
    case 'entry':   return '#a78bfa';
    case 'cert':    return '#fbbf24';
    case 'rotate':  return '#4ade80';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function SpiffePanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveTtl,     setLiveTtl]     = useState(58);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);
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
            setLiveTtl(prev => prev > 1 ? prev - 1 : 60);
          }, 60000);
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
          construx@identity — spiffe · spire · svid · zero-trust · x509
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveTtl}min TTL` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@identity# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          spiffe · spire · svid · x509 · zero-trust · no-static-secrets
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>SPIRE 1.9 ·</span>
          <span style={{ color: '#4ade80' }}>3 SVIDs</span>
          <span style={{ color: '#67e8f9' }}>auto-rotate</span>
          <span style={{ color: '#a78bfa' }}>zero-trust</span>
          <span style={{ color: '#fbbf24' }}>no secrets</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          spiffe · spire · svid · x509 · attestation · zero-trust · mtls
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● attesting' : 'loading'}
        </span>
      </div>
    </div>
  );
}
