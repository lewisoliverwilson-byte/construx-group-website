'use client';

import { useState, useEffect, useRef } from 'react';

interface Span {
  service:  string;
  op:       string;
  startMs:  number;
  durationMs: number;
  status:   'ok' | 'error' | 'slow';
  tags?:    string;
}

const TOTAL_MS = 312;

const SPANS: Span[] = [
  { service: 'web',        op: 'HTTP POST /api/orders',       startMs: 0,   durationMs: 312, status: 'ok',   tags: 'http.status=201' },
  { service: 'web',        op: 'middleware.auth',             startMs: 2,   durationMs: 14,  status: 'ok'   },
  { service: 'web',        op: 'middleware.rateLimit',        startMs: 16,  durationMs: 3,   status: 'ok'   },
  { service: 'orders-api', op: 'orders.create',               startMs: 22,  durationMs: 280, status: 'ok'   },
  { service: 'orders-api', op: 'db.query SELECT products',    startMs: 26,  durationMs: 18,  status: 'ok',   tags: 'db.rows=4' },
  { service: 'orders-api', op: 'inventory.check',             startMs: 48,  durationMs: 91,  status: 'slow', tags: 'items=4' },
  { service: 'inventory',  op: 'HTTP GET /inventory/check',   startMs: 50,  durationMs: 88,  status: 'slow', tags: 'http.status=200' },
  { service: 'inventory',  op: 'db.query SELECT stock',       startMs: 54,  durationMs: 71,  status: 'slow', tags: 'db.rows=4 db.table=inventory' },
  { service: 'orders-api', op: 'payment.charge',              startMs: 144, durationMs: 112, status: 'ok',   tags: 'provider=stripe' },
  { service: 'payments',   op: 'HTTP POST /charge',           startMs: 146, durationMs: 108, status: 'ok',   tags: 'http.status=200' },
  { service: 'orders-api', op: 'db.insert orders',            startMs: 260, durationMs: 22,  status: 'ok',   tags: 'db.table=orders' },
  { service: 'orders-api', op: 'queue.publish order.created', startMs: 286, durationMs: 8,   status: 'ok',   tags: 'queue=orders:events' },
  { service: 'orders-api', op: 'cache.set order:ord_01JA',    startMs: 296, durationMs: 5,   status: 'ok',   tags: 'ttl=3600' },
];

const TOTAL = SPANS.length;

const SERVICE_COLORS: Record<string, string> = {
  'web':        '#60a5fa',
  'orders-api': '#4ade80',
  'inventory':  '#fbbf24',
  'payments':   '#a78bfa',
};

function statusColor(s: Span['status']): string {
  if (s === 'error') return '#f87171';
  if (s === 'slow')  return '#fbbf24';
  return '#4ade80';
}

function barWidth(span: Span, containerPct: number = 100): number {
  return Math.max(1, (span.durationMs / TOTAL_MS) * containerPct);
}

function barOffset(span: Span, containerPct: number = 100): number {
  return (span.startMs / TOTAL_MS) * containerPct;
}

export default function JaegerTracePanel() {
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
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 84);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone    = revealed > TOTAL;
  const shownSpans = SPANS.slice(0, Math.min(SPANS.length, revealed));

  const services = [...new Set(SPANS.map((s) => s.service))];

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
          construx@jaeger — trace explorer
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `312ms · 1 warn` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          jaeger-query trace --id 3f8a2c1e9d4b7f0e --service web
        </span>
      </div>

      {/* Trace metadata */}
      {shownSpans.length > 0 && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.25)' }}
        >
          <span>Trace <span style={{ color: '#60a5fa' }}>3f8a2c1e9d4b7f0e</span></span>
          <span>{TOTAL} spans</span>
          <span>{services.length} services</span>
          <span style={{ color: '#fbbf24' }}>1 slow span</span>
          <span>{TOTAL_MS}ms total</span>
          {services.map((s) => (
            <span key={s} style={{ color: SERVICE_COLORS[s] ?? 'rgba(240,239,255,0.4)' }}>● {s}</span>
          ))}
        </div>
      )}

      {/* Timeline header */}
      {shownSpans.length > 0 && (
        <div className="flex px-4 pt-2 pb-0.5">
          <div style={{ minWidth: '220px', flexShrink: 0 }} />
          <div className="flex-1 flex justify-between text-[6px]" style={{ color: 'rgba(240,239,255,0.15)' }}>
            <span>0ms</span>
            <span>78ms</span>
            <span>156ms</span>
            <span>234ms</span>
            <span>312ms</span>
          </div>
        </div>
      )}

      {/* Spans */}
      <div className="px-4 pb-2 space-y-px">
        {shownSpans.map((span, i) => {
          const svcColor = SERVICE_COLORS[span.service] ?? 'rgba(240,239,255,0.4)';
          const wPct     = barWidth(span);
          const oPct     = barOffset(span);
          return (
            <div key={i} className="flex items-center gap-0 text-[7px] leading-[2]">
              {/* Service + op name */}
              <div
                className="shrink-0 flex items-center gap-1.5 overflow-hidden"
                style={{ minWidth: '220px', paddingRight: '8px' }}
              >
                <span
                  className="shrink-0 text-[6px] uppercase tracking-wide"
                  style={{ color: svcColor, minWidth: '68px' }}
                >
                  {span.service}
                </span>
                <span
                  style={{ color: 'rgba(240,239,255,0.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {span.op}
                </span>
              </div>

              {/* Timeline bar */}
              <div className="flex-1 relative" style={{ height: '12px' }}>
                <div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{
                    left:     `${oPct}%`,
                    width:    `${wPct}%`,
                    height:   '6px',
                    background: statusColor(span.status),
                    opacity:  0.7,
                    borderRadius: '1px',
                    minWidth: '2px',
                  }}
                />
              </div>

              {/* Duration */}
              <span
                className="shrink-0 tabular-nums"
                style={{ color: statusColor(span.status), minWidth: '40px', textAlign: 'right', paddingLeft: '6px' }}
              >
                {span.durationMs}ms
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>
            {SPANS.filter((s) => s.status === 'ok').length} ok
          </span>
          <span style={{ color: '#fbbf24' }}>
            {SPANS.filter((s) => s.status === 'slow').length} slow
          </span>
          <span>root span: 312ms</span>
          <span>db: 111ms · external: 108ms · queue: 8ms</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          jaeger 1.62 · otel collector 0.112 · w3c traceparent
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${TOTAL} spans` : 'loading'}
        </span>
      </div>
    </div>
  );
}
