'use client';

import { useState, useEffect, useRef } from 'react';

interface Span {
  name:     string;
  service:  string;
  offset:   number;
  duration: number;
  depth:    number;
  status:   'OK' | 'ERROR' | 'SLOW';
  isLive?:  boolean;
  prefix:   string;
}

const TOTAL_MS = 512;

const SPANS: Span[] = [
  { name: 'POST /api/v1/workspace/create', service: 'construx-api',  offset:   0, duration: 512, depth: 0, status: 'OK',   prefix: '' },
  { name: 'auth.verifyJWT',               service: 'auth-service',   offset:   2, duration:  19, depth: 1, status: 'OK',   prefix: '├─' },
  { name: 'db.query (users)',             service: 'postgres',        offset:  22, duration:  11, depth: 1, status: 'OK',   prefix: '├─' },
  { name: 'workspace.create',            service: 'construx-api',    offset:  35, duration: 408, depth: 1, status: 'OK',   prefix: '├─' },
  { name: 'db.insert (workspaces)',       service: 'postgres',        offset:  36, duration:  14, depth: 2, status: 'OK',   prefix: '│ ├─' },
  { name: 's3.putObject',                service: 's3',              offset:  52, duration: 224, depth: 2, status: 'OK',   prefix: '│ ├─' },
  { name: 'stripe.createCustomer',       service: 'stripe-sdk',      offset:  53, duration: 148, depth: 2, status: 'OK',   prefix: '│ ├─', isLive: true },
  { name: 'redis.set (session)',         service: 'redis',           offset: 203, duration:   9, depth: 2, status: 'OK',   prefix: '│ ├─' },
  { name: 'resend.sendEmail',            service: 'resend-sdk',      offset: 214, duration: 182, depth: 2, status: 'SLOW', prefix: '│ └─', isLive: true },
  { name: 'cache.invalidate',            service: 'redis',           offset: 445, duration:   7, depth: 1, status: 'OK',   prefix: '├─' },
  { name: 'http.response (201)',         service: 'construx-api',    offset: 455, duration:   5, depth: 1, status: 'OK',   prefix: '└─' },
];

const ATTRS = [
  { key: 'http.method',          value: 'POST' },
  { key: 'http.status_code',     value: '201' },
  { key: 'http.route',           value: '/api/v1/workspace/create' },
  { key: 'net.peer.ip',          value: '172.16.0.12' },
  { key: 'service.version',      value: '1.14.3' },
  { key: 'deployment.environment', value: 'production' },
  { key: 'k8s.pod.name',         value: 'construx-api-7f9d6c-xr2pk' },
];

const TOTAL = SPANS.length + ATTRS.length;

function statusColor(s: Span['status']): string {
  if (s === 'ERROR') return '#f87171';
  if (s === 'SLOW')  return '#fbbf24';
  return '#4ade80';
}

function serviceColor(svc: string): string {
  if (svc === 'construx-api') return 'rgba(249,115,22,0.7)';
  if (svc === 'postgres')     return '#60a5fa';
  if (svc === 'redis')        return '#f87171';
  if (svc === 'auth-service') return '#a78bfa';
  if (svc === 'stripe-sdk')   return '#fbbf24';
  if (svc === 'resend-sdk')   return '#67e8f9';
  if (svc === 's3')           return '#4ade80';
  return 'rgba(240,239,255,0.4)';
}

function SpanBar({ span, live }: { span: Span; live: boolean }) {
  const left    = (span.offset   / TOTAL_MS) * 100;
  const width   = Math.max((span.duration / TOTAL_MS) * 100, 0.4);
  const color   = statusColor(span.status);
  const opacity = span.isLive && live ? 0.9 : 0.45;
  return (
    <div style={{ position: 'relative', height: '6px', flex: 1 }}>
      <div
        style={{
          position: 'absolute',
          left: `${left}%`,
          width: `${width}%`,
          height: '6px',
          background: color,
          opacity,
          borderRadius: '1px',
          transition: span.isLive ? 'width 0.4s ease' : undefined,
        }}
      />
    </div>
  );
}

export default function OtelTracesPanel() {
  const [revealed, setRevealed] = useState(0);
  const [live,     setLive]     = useState(false);
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
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 76);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => setLive((l) => !l), 2200);
    return () => clearInterval(id);
  }, []);

  const allDone      = revealed > TOTAL;
  const shownSpans   = SPANS.slice(0, Math.max(0, Math.min(SPANS.length, revealed)));
  const shownAttrs   = ATTRS.slice(0, Math.max(0, Math.min(ATTRS.length, revealed - SPANS.length)));

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
          construx@sys — otel-collector traces export
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${TOTAL_MS}ms` : 'tracing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          otel-traces --trace-id a3f2b1c0d4e5 --format waterfall --service construx-api
        </span>
      </div>

      {/* Trace header */}
      {shownSpans.length > 0 && (
        <div
          className="flex items-center gap-4 px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.16)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span>TRACE</span>
          <span style={{ color: 'rgba(240,239,255,0.28)' }}>a3f2b1c0d4e5f6a7b8c9</span>
          <span className="ml-auto">total {TOTAL_MS}ms · {SPANS.length} spans · 3 services</span>
        </div>
      )}

      {/* Span waterfall */}
      {shownSpans.length > 0 && (
        <div
          className="px-4 py-1"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          {/* Timeline ruler */}
          <div className="flex items-center text-[6px] mb-1 pl-[312px]" style={{ color: 'rgba(240,239,255,0.12)' }}>
            {[0, 128, 256, 384, 512].map((ms) => (
              <span key={ms} style={{ position: 'absolute', marginLeft: `calc(${(ms / TOTAL_MS) * 100}% * 0.4)` }}>
                {ms}
              </span>
            ))}
          </div>
          <div className="space-y-0.5">
            {shownSpans.map((span, i) => (
              <div key={i} className="flex items-center gap-2 text-[7.5px] leading-[1.7]">
                {/* Indent + name */}
                <div style={{ minWidth: '200px', flexShrink: 0, display: 'flex', gap: '3px' }}>
                  {span.depth > 0 && (
                    <span style={{ color: 'rgba(240,239,255,0.12)', whiteSpace: 'pre', fontSize: '7px' }}>
                      {span.prefix}
                    </span>
                  )}
                  <span
                    style={{
                      color: span.depth === 0 ? 'rgba(240,239,255,0.65)' : 'rgba(240,239,255,0.42)',
                      fontWeight: span.depth === 0 ? 700 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {span.name}
                  </span>
                </div>
                {/* Service */}
                <span style={{ minWidth: '88px', flexShrink: 0, color: serviceColor(span.service), fontSize: '7px' }}>
                  {span.service}
                </span>
                {/* Duration */}
                <span style={{ minWidth: '38px', flexShrink: 0, color: 'rgba(240,239,255,0.3)', textAlign: 'right', fontSize: '7px' }}>
                  {span.duration}ms
                </span>
                {/* Status */}
                <span style={{ minWidth: '34px', flexShrink: 0, color: statusColor(span.status), fontSize: '6.5px', fontWeight: 700 }}>
                  {span.status}
                </span>
                {/* Bar */}
                <SpanBar span={span} live={live} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Span attributes */}
      {shownAttrs.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — root span attributes
          </div>
          <div className="space-y-0.5">
            {shownAttrs.map((a, i) => (
              <div key={i} className="flex items-center text-[7.5px] leading-[1.65]">
                <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '196px', flexShrink: 0 }}>{a.key}</span>
                <span style={{ color: '#60a5fa' }}>{a.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>● OK</span>
          <span>p50: 312ms</span>
          <span>p99: 504ms</span>
          <span>error rate: 0.0%</span>
          <span className="ml-auto">exported to tempo</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          opentelemetry-collector 0.96.0 · otlp/http · grafana tempo
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${SPANS.length} spans` : 'loading'}
        </span>
      </div>
    </div>
  );
}
