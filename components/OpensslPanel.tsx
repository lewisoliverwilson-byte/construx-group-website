'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'cert-ok' | 'cert-warn' | 'cert-field' | 'key-info' | 'verify-ok' | 'verify-fail' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',     text: '# openssl s_client: inspect a live TLS certificate' },
  { kind: 'prompt',      text: 'echo | openssl s_client -connect api.construx.io:443 -servername api.construx.io 2>/dev/null | openssl x509 -noout -text' },
  { kind: 'cert-field',  text: 'Subject: CN=api.construx.io' },
  { kind: 'cert-field',  text: 'Issuer:  C=US, O=Let\'s Encrypt, CN=E6' },
  { kind: 'cert-field',  text: 'Not Before: Jan 14 00:00:00 2032 GMT' },
  { kind: 'cert-ok',     text: 'Not After:  Apr 14 23:59:59 2032 GMT  ✓ valid' },
  { kind: 'cert-field',  text: 'Public Key Algorithm: id-ecPublicKey  (prime256v1, 256 bit)' },
  { kind: 'cert-field',  text: 'Signature Algorithm: ecdsa-with-SHA384' },
  { kind: 'cert-field',  text: 'Subject Alt Names: api.construx.io, *.construx.io' },
  { kind: 'blank',       text: '' },
  { kind: 'comment',     text: '# Check expiry in days (CI/CD cert monitor)' },
  { kind: 'prompt',      text: 'echo | openssl s_client -connect api.construx.io:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2' },
  { kind: 'cert-ok',     text: 'Apr 14 23:59:59 2032 GMT   (99 days remaining)' },
  { kind: 'blank',       text: '' },
  { kind: 'comment',     text: '# Generate ECDSA private key + self-signed cert (dev use)' },
  { kind: 'prompt',      text: 'openssl ecparam -name prime256v1 -genkey -noout -out server.key' },
  { kind: 'key-info',    text: 'Generating EC key pair (prime256v1, 256 bit)' },
  { kind: 'prompt',      text: 'openssl req -new -x509 -key server.key -out server.crt -days 365 -subj "/CN=localhost"' },
  { kind: 'cert-ok',     text: 'wrote server.crt  (self-signed, ECDSA, SHA-256)' },
  { kind: 'blank',       text: '' },
  { kind: 'comment',     text: '# Verify certificate chain against a CA bundle' },
  { kind: 'prompt',      text: 'openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt server.crt' },
  { kind: 'verify-ok',   text: 'server.crt: OK' },
  { kind: 'blank',       text: '' },
  { kind: 'comment',     text: '# Check cipher suites: reject TLSv1.0 and TLSv1.1' },
  { kind: 'prompt',      text: 'openssl s_client -connect api.construx.io:443 -tls1 2>&1 | grep "alert\|error"' },
  { kind: 'verify-fail', text: 'ERROR: 14004438:SSL routines::tlsv1 alert protocol version (server rejects TLS 1.0)' },
  { kind: 'cert-ok',     text: 'openssl s_client -connect api.construx.io:443 -tls1_3 → Protocol: TLSv1.3  ✓' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':     return 'rgba(240,239,255,0.22)';
    case 'prompt':      return 'rgba(240,239,255,0.6)';
    case 'cert-ok':     return '#4ade80';
    case 'cert-warn':   return '#fbbf24';
    case 'cert-field':  return '#67e8f9';
    case 'key-info':    return '#a78bfa';
    case 'verify-ok':   return '#4ade80';
    case 'verify-fail': return '#f87171';
    default:            return 'transparent';
  }
}

export default function OpensslPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveDaysLeft, setLiveDaysLeft] = useState(99);
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
            setLiveDaysLeft(90 + Math.floor(Math.random() * 20));
          }, 2150);
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
          construx@dev — openssl · certificate inspection + key generation
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveDaysLeft}d valid` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          openssl · s_client · x509 · ecparam · verify · cipher check
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>openssl 3.2 ·</span>
          <span style={{ color: '#4ade80' }}>{liveDaysLeft} days remaining</span>
          <span style={{ color: '#67e8f9' }}>ECDSA prime256v1</span>
          <span style={{ color: '#a78bfa' }}>Let&apos;s Encrypt E6</span>
          <span style={{ color: '#f87171' }}>TLS 1.0/1.1 rejected</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          openssl 3.2 · TLS 1.3 · ECDSA · OCSP · s_client · x509 · verify
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● verified' : 'loading'}
        </span>
      </div>
    </div>
  );
}
