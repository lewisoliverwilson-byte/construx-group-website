'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'cert-ok' | 'cert-field' | 'cert-warn' | 'acme' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# step: Smallstep CLI — certificate issuance, inspection, and rotation' },
  { kind: 'prompt',     text: 'step ca certificate api.construx.io server.crt server.key --ca-url https://ca.construx.io' },
  { kind: 'stat',       text: '✔ Provisioner: construx-acme (ACME)  [kid: abc123...]' },
  { kind: 'acme',       text: '✔ Generating keypair  (ECDSA P-256)' },
  { kind: 'acme',       text: '✔ Requesting certificate for api.construx.io' },
  { kind: 'acme',       text: '✔ Challenge type: http-01  port: 80  /.well-known/acme-challenge/...' },
  { kind: 'cert-ok',    text: '✔ Certificate issued  (valid 24h → auto-renew at 22h)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# inspect the issued certificate' },
  { kind: 'prompt',     text: 'step certificate inspect server.crt --short' },
  { kind: 'cert-field', text: '  Subject:   api.construx.io' },
  { kind: 'cert-field', text: '  Issuer:    Construx Intermediate CA (R1)' },
  { kind: 'cert-field', text: '  Valid from: 2032-10-21T10:00:00Z' },
  { kind: 'cert-field', text: '  Valid to:   2032-10-22T10:00:00Z  (23h59m remaining)' },
  { kind: 'cert-field', text: '  SANs:       api.construx.io' },
  { kind: 'cert-ok',    text: '  Signature:  ECDSA P-256 · SHA-256  ✓' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# renew before expiry (run in a cron or systemd timer)' },
  { kind: 'prompt',     text: 'step ca renew server.crt server.key --force --ca-url https://ca.construx.io' },
  { kind: 'cert-ok',    text: '✔ Certificate renewed  (new expiry: 2032-10-23T10:01:18Z)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# verify certificate chain against the CA' },
  { kind: 'prompt',     text: 'step certificate verify server.crt --roots ca.crt' },
  { kind: 'cert-ok',    text: '✔ Certificate is valid  (chain: server.crt → Construx Intermediate CA → Construx Root CA)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# JWT inspection (OIDC / service tokens)' },
  { kind: 'prompt',     text: "step crypto jwt inspect --insecure <<< '$JWT_TOKEN'" },
  { kind: 'stat',       text: '  { "sub": "construx-api", "aud": "api.construx.io", "exp": 1729598400, "iss": "https://ca.construx.io" }' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'cert-ok':    return '#4ade80';
    case 'cert-field': return '#67e8f9';
    case 'cert-warn':  return '#fbbf24';
    case 'acme':       return '#a78bfa';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    default:           return 'transparent';
  }
}

export default function StepCliPanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveDaysLeft,  setLiveDaysLeft]  = useState(24);
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
            setLiveDaysLeft(Math.floor(18 + Math.random() * 8));
          }, 2300);
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
          construx@prod-01 — step · certificate issuance and rotation
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveDaysLeft}h valid` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          step ca certificate · inspect · renew · verify · JWT decode
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>step 0.27 ·</span>
          <span style={{ color: '#4ade80' }}>{liveDaysLeft}h cert valid</span>
          <span style={{ color: '#a78bfa' }}>ACME · P-256</span>
          <span style={{ color: '#67e8f9' }}>auto-renew at 22h</span>
          <span style={{ color: '#fbbf24' }}>Construx Intermediate CA</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          step · ca certificate · inspect · renew · ACME · JWT · mTLS
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● valid' : 'loading'}
        </span>
      </div>
    </div>
  );
}
