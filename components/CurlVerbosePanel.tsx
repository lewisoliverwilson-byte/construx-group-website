'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'tls-ok' | 'tls-info' | 'header-req' | 'header-res' | 'status-line' | 'body' | 'timing' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',     text: '# curl -v: full TLS handshake, request headers, response headers, timing' },
  { kind: 'prompt',      text: 'curl -v -o /dev/null -w "\\n%{time_total}s total" https://api.construx.io/v1/orders' },
  { kind: 'tls-info',   text: '*   Trying 203.0.113.47:443...' },
  { kind: 'tls-ok',     text: '* Connected to api.construx.io (203.0.113.47) port 443' },
  { kind: 'tls-info',   text: '* ALPN: curl offers h2,http/1.1' },
  { kind: 'tls-ok',     text: '* TLSv1.3 (OUT), TLS handshake, Client hello (1)' },
  { kind: 'tls-ok',     text: '* TLSv1.3 (IN),  TLS handshake, Server hello (2)' },
  { kind: 'tls-ok',     text: '* TLSv1.3 (IN),  TLS handshake, Encrypted Extensions (8)' },
  { kind: 'tls-ok',     text: '* TLSv1.3 (IN),  TLS handshake, Certificate (11)' },
  { kind: 'tls-ok',     text: '* TLSv1.3 (IN),  TLS handshake, CERT verify (15)' },
  { kind: 'tls-ok',     text: '* TLSv1.3 (IN),  TLS handshake, Finished (20)' },
  { kind: 'tls-ok',     text: '* TLSv1.3 (OUT), TLS handshake, Finished (20)' },
  { kind: 'tls-info',   text: '* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / RSASSA-PSS' },
  { kind: 'tls-info',   text: '* Server certificate: api.construx.io — valid 2032-01-14 to 2032-04-14' },
  { kind: 'tls-ok',     text: '* SSL certificate verify ok.' },
  { kind: 'blank',       text: '' },
  { kind: 'header-req',  text: '> GET /v1/orders HTTP/2' },
  { kind: 'header-req',  text: '> Host: api.construx.io' },
  { kind: 'header-req',  text: '> Accept: */*' },
  { kind: 'header-req',  text: '> Authorization: Bearer ey...' },
  { kind: 'header-req',  text: '> User-Agent: construx-cli/1.4.2' },
  { kind: 'blank',       text: '' },
  { kind: 'status-line', text: '< HTTP/2 200' },
  { kind: 'header-res',  text: '< content-type: application/json' },
  { kind: 'header-res',  text: '< content-length: 3841' },
  { kind: 'header-res',  text: '< x-request-id: 8f3a2c1d-b7e4-4f9a-a1b2-c3d4e5f6a7b8' },
  { kind: 'header-res',  text: '< x-ratelimit-remaining: 497' },
  { kind: 'header-res',  text: '< cache-control: no-store' },
  { kind: 'header-res',  text: '< strict-transport-security: max-age=63072000; includeSubDomains' },
  { kind: 'blank',       text: '' },
  { kind: 'timing',      text: '0.341s total   (dns:0.008 tcp:0.012 tls:0.097 transfer:0.224)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':     return 'rgba(240,239,255,0.22)';
    case 'prompt':      return 'rgba(240,239,255,0.6)';
    case 'tls-ok':      return '#4ade80';
    case 'tls-info':    return '#67e8f9';
    case 'header-req':  return '#a78bfa';
    case 'header-res':  return '#67e8f9';
    case 'status-line': return '#4ade80';
    case 'body':        return 'rgba(240,239,255,0.45)';
    case 'timing':      return '#fbbf24';
    default:            return 'transparent';
  }
}

export default function CurlVerbosePanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveTotalMs, setLiveTotalMs] = useState(341);
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
            setLiveTotalMs(280 + Math.floor(Math.random() * 120));
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
          construx@dev — curl -v · TLS handshake + response timing
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveTotalMs}ms` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          curl -v · TLS 1.3 · HTTP/2 · timing breakdown
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>curl 8.7 ·</span>
          <span style={{ color: '#4ade80' }}>TLS 1.3 verified</span>
          <span style={{ color: '#67e8f9' }}>HTTP/2 · ALPN negotiated</span>
          <span style={{ color: '#a78bfa' }}>X25519 key exchange</span>
          <span style={{ color: '#fbbf24' }}>{liveTotalMs}ms total</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          curl 8.7 · TLSv1.3 · AES-256-GCM · HTTP/2 · HSTS
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● secure' : 'loading'}
        </span>
      </div>
    </div>
  );
}
