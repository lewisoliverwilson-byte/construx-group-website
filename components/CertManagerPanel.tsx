'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'cert' | 'renewal' | 'challenge' | 'vault' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# cert-manager: kubernetes tls automation — acme, vault pki, auto-renewal' },
  { kind: 'prompt',    text: 'kubectl get certificate -A' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# certificates: 2 ready  0 expired  0 issuing' },
  { kind: 'cert',      text: '  ingress-nginx  construx-io-wildcard   True  letsencrypt-prod  62d' },
  { kind: 'cert',      text: '  construx-prod  construx-api-tls        True  vault-pki-internal 4h' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# renewal windows: days until auto-renew triggered' },
  { kind: 'renewal',   text: '  construx-io-wildcard:  expires 2033-12-12  renews 2033-11-12  30d left' },
  { kind: 'renewal',   text: '  construx-api-tls:      expires 4h           renews 8h before    vault PKI' },
  { kind: 'blank',     text: '' },
  { kind: 'challenge', text: '  last challenge: DNS-01 route53  txt _acme-challenge.construx.io  ok' },
  { kind: 'vault',     text: '  vault-pki: intermediate CA  path:pki/sign/construx  auth:k8s' },
  { kind: 'metric',    text: '  sync-calls: 842  renewals-this-month: 3  cert-age-p50: 28d' },
  { kind: 'stat',      text: '  2 certs  2 issuers  acme+vault  cert-manager 1.16' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'cert':      return '#4ade80';
    case 'renewal':   return '#67e8f9';
    case 'challenge': return '#a78bfa';
    case 'vault':     return '#fbbf24';
    case 'metric':    return 'rgba(240,239,255,0.5)';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function CertManagerPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveDays,    setLiveDays]    = useState(30);
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
            setLiveDays(28 + Math.floor(Math.random() * 5));
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
          construx@certs — cert-manager · acme · vault-pki · auto-renewal · tls
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveDays}d left` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@certs# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cert-manager · acme · dns-01 · vault · auto-renewal · x509
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>cert-manager 1.16 ·</span>
          <span style={{ color: '#4ade80' }}>2 certs valid</span>
          <span style={{ color: '#67e8f9' }}>{liveDays}d to renew</span>
          <span style={{ color: '#a78bfa' }}>dns-01 ok</span>
          <span style={{ color: '#fbbf24' }}>vault pki</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          cert-manager · acme · vault-pki · auto-renewal · x509 · tls
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● all valid' : 'loading'}
        </span>
      </div>
    </div>
  );
}
