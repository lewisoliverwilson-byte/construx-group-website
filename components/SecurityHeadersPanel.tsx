'use client';

import { useState, useEffect, useRef } from 'react';

interface HeaderEntry {
  name:    string;
  value:   string;
  score:   'pass' | 'warn' | 'fail' | 'info';
  note:    string;
}

const HEADERS: HeaderEntry[] = [
  {
    name:  'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
    score: 'pass',
    note:  'HSTS preload eligible · 1-year max-age',
  },
  {
    name:  'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'nonce-…'; img-src 'self' data: blob:",
    score: 'pass',
    note:  'Nonce-based CSP · blocks inline scripts',
  },
  {
    name:  'X-Content-Type-Options',
    value: 'nosniff',
    score: 'pass',
    note:  'Prevents MIME-type sniffing attacks',
  },
  {
    name:  'X-Frame-Options',
    value: 'DENY',
    score: 'pass',
    note:  'Clickjacking protection · deny all framing',
  },
  {
    name:  'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
    score: 'pass',
    note:  'Limits referrer data to same-origin full URL',
  },
  {
    name:  'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
    score: 'pass',
    note:  'Camera, mic, geolocation disabled',
  },
  {
    name:  'Cross-Origin-Opener-Policy',
    value: 'same-origin',
    score: 'pass',
    note:  'Isolates browsing context · prevents Spectre',
  },
  {
    name:  'Cross-Origin-Embedder-Policy',
    value: 'require-corp',
    score: 'pass',
    note:  'Enables SharedArrayBuffer · cross-origin isolation',
  },
  {
    name:  'Cross-Origin-Resource-Policy',
    value: 'same-origin',
    score: 'pass',
    note:  'Blocks cross-origin reads of this resource',
  },
  {
    name:  'X-DNS-Prefetch-Control',
    value: 'off',
    score: 'info',
    note:  'DNS prefetching disabled for privacy',
  },
  {
    name:  'X-XSS-Protection',
    value: '0',
    score: 'info',
    note:  'Deprecated · CSP provides stronger protection',
  },
  {
    name:  'Cache-Control',
    value: 'no-store, max-age=0',
    score: 'pass',
    note:  'Sensitive responses not cached',
  },
  {
    name:  'Server',
    value: '(not set)',
    score: 'pass',
    note:  'Server banner suppressed · no version leak',
  },
  {
    name:  'X-Powered-By',
    value: '(removed)',
    score: 'pass',
    note:  'Framework fingerprinting suppressed',
  },
];

const GRADES = { pass: 'A+', warn: 'B', fail: 'F', info: 'A' };

function scoreColor(score: HeaderEntry['score']): string {
  if (score === 'pass') return '#4ade80';
  if (score === 'warn') return '#fbbf24';
  if (score === 'fail') return '#f87171';
  return '#60a5fa';
}

function scoreIcon(score: HeaderEntry['score']): string {
  if (score === 'pass') return '✓';
  if (score === 'warn') return '△';
  if (score === 'fail') return '✗';
  return 'ℹ';
}

export default function SecurityHeadersPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > HEADERS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 88);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > HEADERS.length;
  const displayed = HEADERS.slice(0, allDone ? HEADERS.length : revealed);

  const passes  = displayed.filter((h) => h.score === 'pass').length;
  const warns   = displayed.filter((h) => h.score === 'warn').length;
  const fails   = displayed.filter((h) => h.score === 'fail').length;
  const overall = fails > 0 ? 'F' : warns > 0 ? 'B' : allDone ? 'A+' : '…';
  const overallColor = fails > 0 ? '#f87171' : warns > 0 ? '#fbbf24' : '#4ade80';

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
          construx@sys — security-headers audit construxgroup.io
        </span>
        {allDone && (
          <span className="text-[9px] font-bold tabular-nums" style={{ color: overallColor }}>
            {overall}
          </span>
        )}
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>curl -sI https://construxgroup.io | grep -iE &apos;security|content|x-|cache|server|referrer|permissions&apos;</span>
      </div>

      {/* Rows */}
      <div className="px-4 py-2 space-y-1">
        {displayed.map((h, i) => (
          <div key={i} className="flex items-start gap-2.5 text-[8px] leading-[1.6]">
            <span className="flex-shrink-0 w-3 text-center font-bold" style={{ color: scoreColor(h.score) }}>
              {scoreIcon(h.score)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span style={{ color: 'rgba(240,239,255,0.7)', fontWeight: 600 }}>
                  {h.name}
                </span>
                <span
                  className="text-[7px] px-1 py-px font-bold uppercase tracking-widest"
                  style={{
                    color:       scoreColor(h.score),
                    background:  `${scoreColor(h.score)}14`,
                    borderRadius: '2px',
                    flexShrink: 0,
                  }}
                >
                  {GRADES[h.score]}
                </span>
              </div>
              <div className="mt-0.5" style={{ color: 'rgba(240,239,255,0.28)' }}>
                {h.value}
              </div>
              <div className="mt-0.5" style={{ color: 'rgba(240,239,255,0.18)' }}>
                {h.note}
              </div>
            </div>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-4 px-4 py-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[8px]" style={{ color: 'rgba(74,222,128,0.6)' }}>PASS {passes}</span>
          {warns > 0 && <span className="text-[8px]" style={{ color: 'rgba(251,191,36,0.6)' }}>WARN {warns}</span>}
          {fails > 0 && <span className="text-[8px]" style={{ color: 'rgba(248,113,113,0.6)' }}>FAIL {fails}</span>}
          <span className="text-[8px] ml-auto font-bold" style={{ color: overallColor }}>
            GRADE {overall}
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          securityheaders.com · construxgroup.io · TLS 1.3
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● complete' : 'scanning'}
        </span>
      </div>
    </div>
  );
}
