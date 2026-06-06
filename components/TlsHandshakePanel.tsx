'use client';

import { useState, useEffect, useRef } from 'react';

interface TlsLine {
  label:  string;
  value:  string;
  type:   'ok' | 'info' | 'cert' | 'dim' | 'warn';
}

const LINES: TlsLine[] = [
  { label: 'Connecting to',    value: 'construxgroup.io:443 (104.21.14.220)',    type: 'info' },
  { label: 'Protocol',         value: 'TLSv1.3',                                 type: 'ok'   },
  { label: 'Cipher',           value: 'TLS_AES_256_GCM_SHA384',                  type: 'ok'   },
  { label: 'Session',          value: 'TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384',type: 'dim' },
  { label: 'Server Public Key','value': '256 bit EC (secp256r1)',                 type: 'info' },
  { label: 'OCSP Staple',      value: 'Response Status: successful (0x0)',        type: 'ok'   },
  { label: '─── Certificate Chain ───', value: '', type: 'dim' },
  { label: 'Leaf (0)',         value: 'construxgroup.io',                         type: 'cert' },
  { label: '  Subject',       value: 'CN=construxgroup.io',                      type: 'dim'  },
  { label: '  SAN',           value: 'DNS:construxgroup.io, DNS:*.construxgroup.io', type: 'dim' },
  { label: '  Issuer',        value: "CN=E5, O=Let's Encrypt, C=US",             type: 'dim'  },
  { label: '  Not Before',    value: '2029-11-14 00:00:00 UTC',                  type: 'dim'  },
  { label: '  Not After',     value: '2030-02-12 23:59:59 UTC',                  type: 'ok'   },
  { label: '  Key',           value: 'EC 256-bit P-256',                          type: 'dim'  },
  { label: '  OCSP URL',      value: 'http://e5.o.lencr.org',                    type: 'dim'  },
  { label: 'Intermediate (1)','value': "E5 — Let's Encrypt",                     type: 'cert' },
  { label: '  Issuer',       'value': 'CN=ISRG Root X1, O=Internet Security Research Group', type: 'dim' },
  { label: 'Root (2)',         value: 'ISRG Root X1',                             type: 'cert' },
  { label: '─── Verify ───',  value: '', type: 'dim' },
  { label: 'Chain depth',      value: '3 (leaf + 1 intermediate + root)',          type: 'info' },
  { label: 'Verification',     value: 'OK — certificate chain valid',             type: 'ok'   },
  { label: 'Return code',      value: '0 (ok)',                                    type: 'ok'   },
];

function typeColor(t: TlsLine['type']): string {
  if (t === 'ok')   return '#4ade80';
  if (t === 'cert') return '#a78bfa';
  if (t === 'info') return '#67e8f9';
  if (t === 'warn') return '#fbbf24';
  return 'rgba(240,239,255,0.3)';
}

function labelColor(t: TlsLine['type']): string {
  if (t === 'ok')   return 'rgba(240,239,255,0.5)';
  if (t === 'dim')  return 'rgba(240,239,255,0.22)';
  return 'rgba(240,239,255,0.45)';
}

export default function TlsHandshakePanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > LINES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 90);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > LINES.length;
  const displayed = LINES.slice(0, allDone ? LINES.length : revealed);

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
          construx@sys — tls handshake
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '✓ verified' : 'handshaking…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          openssl s_client -connect construxgroup.io:443 -showcerts -brief
        </span>
      </div>

      {/* Lines */}
      <div className="px-4 py-2 space-y-0.5">
        {displayed.map((line, i) => (
          <div key={i} className="flex items-start gap-2 text-[8px]">
            {line.label.startsWith('─') ? (
              <span className="w-full" style={{ color: 'rgba(255,255,255,0.1)' }}>{line.label}</span>
            ) : (
              <>
                <span style={{ color: labelColor(line.type), minWidth: '124px', flexShrink: 0 }}>
                  {line.label}
                </span>
                {line.value && (
                  <span style={{ color: typeColor(line.type), lineHeight: 1.4 }}>
                    {line.value}
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          openssl 3.4 · tlsv1.3 · chain depth 3 · ocsp ok
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● verified' : 'negotiating'}
        </span>
      </div>
    </div>
  );
}
