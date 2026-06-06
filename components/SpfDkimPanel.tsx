'use client';

import { useState, useEffect, useRef } from 'react';

interface EmailRecord {
  type:    string;
  status:  'pass' | 'warn' | 'fail';
  value:   string;
  detail?: string;
  accent:  string;
}

const RECORDS: EmailRecord[] = [
  {
    type:   'SPF',
    status: 'pass',
    value:  'v=spf1 include:amazonses.com include:_spf.google.com ~all',
    detail: 'construxgroup.io · TXT',
    accent: '#4ade80',
  },
  {
    type:   'DKIM',
    status: 'pass',
    value:  'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ…',
    detail: 's1._domainkey.construxgroup.io',
    accent: '#4ade80',
  },
  {
    type:   'DKIM',
    status: 'pass',
    value:  'v=DKIM1; k=ed25519; p=MCowBQYDK2VwAyEA…',
    detail: 'resend._domainkey.construxgroup.io',
    accent: '#4ade80',
  },
  {
    type:   'DMARC',
    status: 'pass',
    value:  'v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@construxgroup.io',
    detail: '_dmarc.construxgroup.io',
    accent: '#F97316',
  },
  {
    type:   'MTA-STS',
    status: 'pass',
    value:  'v=STSv1; id=20291101000000Z',
    detail: '_mta-sts.construxgroup.io · max_age: 604800',
    accent: '#a78bfa',
  },
  {
    type:   'TLS-RPT',
    status: 'pass',
    value:  'v=TLSRPTv1; rua=mailto:tlsrpt@construxgroup.io',
    detail: '_smtp._tls.construxgroup.io',
    accent: '#67e8f9',
  },
  {
    type:   'BIMI',
    status: 'warn',
    value:  'v=BIMI1; l=https://construxgroup.io/bimi-logo.svg',
    detail: 'default._bimi.construxgroup.io · VMC pending',
    accent: '#fbbf24',
  },
];

function statusIcon(status: EmailRecord['status']) {
  if (status === 'pass') return { icon: '✓', color: '#4ade80' };
  if (status === 'warn') return { icon: '⚠', color: '#fbbf24' };
  return { icon: '✗', color: '#f87171' };
}

export default function SpfDkimPanel() {
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
    if (revealed === 0 || revealed > RECORDS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 110);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone   = revealed > RECORDS.length;
  const passCount = RECORDS.filter((r) => r.status === 'pass').length;
  const warnCount = RECORDS.filter((r) => r.status === 'warn').length;
  const failCount = RECORDS.filter((r) => r.status === 'fail').length;
  const allPass   = allDone && failCount === 0;

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
          construx@sys — email auth records
        </span>
        <span
          className="text-[8px] uppercase tracking-widest tabular-nums"
          style={{ color: allDone ? (allPass ? 'rgba(74,222,128,0.7)' : 'rgba(251,191,36,0.7)') : 'rgba(240,239,255,0.2)' }}
        >
          {allDone ? (allPass ? '✓ all pass' : `${warnCount} warn`) : 'checking…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          dig +short TXT construxgroup.io _dmarc.construxgroup.io
        </span>
      </div>

      {/* Records */}
      <div className="px-4 py-3 space-y-3">
        {RECORDS.slice(0, revealed).map((r, i) => {
          const { icon, color } = statusIcon(r.status);
          return (
            <div key={i} className="text-[8px]">
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{ color, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
                <span style={{ color: r.accent, fontWeight: 700, minWidth: '64px', flexShrink: 0 }}>{r.type}</span>
                {r.detail && (
                  <span style={{ color: 'rgba(240,239,255,0.25)' }}>{r.detail}</span>
                )}
              </div>
              <div className="pl-5 mt-0.5">
                <span
                  style={{
                    color:       'rgba(240,239,255,0.38)',
                    wordBreak:   'break-all',
                    display:     'block',
                    maxWidth:    '520px',
                    whiteSpace:  'pre-wrap',
                  }}
                >
                  {r.value}
                </span>
              </div>
              {i < RECORDS.length - 1 && (
                <div className="mt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {passCount} pass · {warnCount} warn · {failCount} fail · construxgroup.io
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          spf · dkim · dmarc
        </span>
      </div>
    </div>
  );
}
