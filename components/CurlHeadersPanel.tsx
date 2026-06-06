'use client';

import { useState, useEffect, useRef } from 'react';

interface HeaderLine {
  key: string;
  value: string;
  highlight?: boolean;
}

const STATUS_LINE = 'HTTP/2 200';

const HEADERS: HeaderLine[] = [
  { key: 'content-type',              value: 'text/html; charset=utf-8' },
  { key: 'cache-control',             value: 'public, max-age=0, must-revalidate', highlight: true },
  { key: 'x-powered-by',             value: 'Next.js 15.3.3' },
  { key: 'strict-transport-security', value: 'max-age=63072000; includeSubDomains; preload', highlight: true },
  { key: 'x-content-type-options',   value: 'nosniff' },
  { key: 'x-frame-options',          value: 'DENY' },
  { key: 'x-xss-protection',         value: '1; mode=block' },
  { key: 'content-security-policy',  value: "default-src 'self'; script-src 'self' 'unsafe-inline'", highlight: true },
  { key: 'referrer-policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'permissions-policy',       value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'x-construx-edge',          value: 'LHR-01 · AWS CloudFront', highlight: true },
  { key: 'x-construx-deploy',        value: 'amplify/master/cbfde07' },
  { key: 'x-construx-region',        value: 'eu-west-2' },
  { key: 'vary',                      value: 'Accept-Encoding' },
  { key: 'server',                    value: 'CloudFront' },
  { key: 'via',                       value: '1.1 cloudfront (CloudFront)' },
  { key: 'x-cache',                   value: 'Hit from cloudfront', highlight: true },
  { key: 'age',                       value: '1842' },
  { key: 'content-encoding',          value: 'br' },
];

const TOTAL_TIME_MS = 42;

export default function CurlHeadersPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > HEADERS.length + 1) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 60);
    return () => clearTimeout(id);
  }, [revealed]);

  const headersVisible = Math.max(0, revealed - 1);

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
          construx@sys — http response headers
        </span>
        <span
          className="text-[8px] uppercase tracking-widest"
          style={{ color: 'rgba(74,222,128,0.6)' }}
        >
          {TOTAL_TIME_MS}ms
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          curl -sI https://construxgroup.io | head -n 22
        </span>
      </div>

      {/* Response */}
      <div className="px-4 py-3">
        {/* Status line */}
        <div
          className="text-[9px] mb-2 font-semibold"
          style={{
            color: 'rgba(74,222,128,0.9)',
            opacity: revealed >= 1 ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          {STATUS_LINE}
        </div>

        {/* Header lines */}
        <div className="space-y-0.5">
          {HEADERS.map((header, i) => (
            <div
              key={header.key}
              className="flex text-[8px] leading-[1.7]"
              style={{
                opacity: i < headersVisible ? 1 : 0,
                transition: 'opacity 0.1s ease',
              }}
            >
              <span
                className="flex-shrink-0"
                style={{
                  color: header.highlight ? 'rgba(125,211,252,0.8)' : 'rgba(167,139,250,0.7)',
                  minWidth: '220px',
                }}
              >
                {header.key}:
              </span>
              <span
                style={{
                  color: header.highlight ? 'rgba(240,239,255,0.65)' : 'rgba(240,239,255,0.35)',
                  marginLeft: '8px',
                }}
              >
                {header.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          construxgroup.io · eu-west-2
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.45)' }}>
          {HEADERS.length} headers
        </span>
      </div>
    </div>
  );
}
