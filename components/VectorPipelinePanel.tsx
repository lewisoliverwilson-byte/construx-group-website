'use client';

import { useState, useEffect, useRef } from 'react';

interface VectorComponent {
  id:       string;
  kind:     'source' | 'transform' | 'sink';
  type:     string;
  eventsPs: number;
  errorsPs: number;
  bytesPs:  number;
}

interface TapEvent {
  ts:        string;
  component: string;
  kind:      'log' | 'metric';
  payload:   string;
}

const COMPONENTS: VectorComponent[] = [
  { id: 'journald',              kind: 'source',    type: 'journald',               eventsPs: 1284, errorsPs: 0,   bytesPs: 312448  },
  { id: 'nginx_access',         kind: 'source',    type: 'file',                   eventsPs: 892,  errorsPs: 0,   bytesPs: 189440  },
  { id: 'parse_nginx',          kind: 'transform', type: 'remap',                  eventsPs: 892,  errorsPs: 2,   bytesPs: 189440  },
  { id: 'filter_errors',        kind: 'transform', type: 'filter',                 eventsPs: 314,  errorsPs: 0,   bytesPs: 66560   },
  { id: 'add_host_metadata',    kind: 'transform', type: 'remap',                  eventsPs: 2176, errorsPs: 0,   bytesPs: 501888  },
  { id: 'elasticsearch',        kind: 'sink',      type: 'elasticsearch',           eventsPs: 2176, errorsPs: 1,   bytesPs: 501888  },
  { id: 'loki',                 kind: 'sink',      type: 'loki',                   eventsPs: 892,  errorsPs: 0,   bytesPs: 189440  },
  { id: 'prometheus_exporter',  kind: 'sink',      type: 'prometheus_exporter',    eventsPs: 314,  errorsPs: 0,   bytesPs: 66560   },
];

const TAP_EVENTS: TapEvent[] = [
  { ts: '14:32:07.112', component: 'parse_nginx',       kind: 'log',    payload: '{"status":200,"method":"GET","path":"/api/orders","latency_ms":12,"host":"prod-01"}' },
  { ts: '14:32:07.118', component: 'filter_errors',     kind: 'log',    payload: '{"status":502,"method":"POST","path":"/api/checkout","latency_ms":3041,"host":"prod-01"}' },
  { ts: '14:32:07.203', component: 'add_host_metadata', kind: 'log',    payload: '{"level":"info","unit":"construx-api.service","msg":"order accepted","order_id":"a3f9b2c1"}' },
  { ts: '14:32:07.381', component: 'parse_nginx',       kind: 'log',    payload: '{"status":200,"method":"GET","path":"/api/products","latency_ms":8,"host":"prod-02"}' },
  { ts: '14:32:07.512', component: 'filter_errors',     kind: 'metric', payload: 'counter{name="http_errors_total",labels={status="502"}} += 1' },
];

const SOURCES    = COMPONENTS.filter((c) => c.kind === 'source');
const TRANSFORMS = COMPONENTS.filter((c) => c.kind === 'transform');
const SINKS      = COMPONENTS.filter((c) => c.kind === 'sink');

const HEADER_LINES = 2;
const TOTAL = HEADER_LINES + SOURCES.length + TRANSFORMS.length + SINKS.length + TAP_EVENTS.length + 6;

function fmtRate(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtBytes(n: number): string {
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)}MB`;
  if (n >= 1024)    return `${Math.round(n / 1024)}KB`;
  return `${n}B`;
}

function kindColor(k: VectorComponent['kind']): string {
  if (k === 'source')    return '#4ade80';
  if (k === 'transform') return '#a78bfa';
  return '#67e8f9';
}

function tapKindColor(k: TapEvent['kind']): string {
  return k === 'metric' ? '#fbbf24' : '#4ade80';
}

export default function VectorPipelinePanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveJournald,  setLiveJournald]  = useState(1284);
  const [liveElastic,   setLiveElastic]   = useState(2176);
  const ref       = useRef<HTMLDivElement>(null);
  const started   = useRef(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveJournald(Math.round(1100 + Math.random() * 400));
            setLiveElastic(Math.round(1900 + Math.random() * 600));
          }, 1900);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 82);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone       = revealed > TOTAL;
  const srcStart      = HEADER_LINES + 1;
  const xfmStart      = srcStart + SOURCES.length + 1;
  const sinkStart     = xfmStart + TRANSFORMS.length + 1;
  const tapStart      = sinkStart + SINKS.length + 2;

  const shownSrc  = SOURCES.slice(0,    Math.max(0, revealed - srcStart));
  const shownXfm  = TRANSFORMS.slice(0, Math.max(0, revealed - xfmStart));
  const shownSink = SINKS.slice(0,      Math.max(0, revealed - sinkStart));
  const shownTap  = TAP_EVENTS.slice(0, Math.max(0, revealed - tapStart));

  const totalEventsPs = liveJournald + 892;

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
          construx@prod-01 — vector top · pipeline topology
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${fmtRate(totalEventsPs)} evt/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>root@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          vector top --interval 1 &amp;&amp; vector tap --component-id filter_errors
        </span>
      </div>

      {/* Pipeline topology */}
      <div className="px-4 pt-2.5 pb-1">

        {/* Sources */}
        {revealed > srcStart - 1 && (
          <div className="text-[7px] uppercase tracking-widest mb-0.5" style={{ color: '#4ade80', opacity: 0.5 }}>
            ── sources
          </div>
        )}
        {shownSrc.map((c) => (
          <div key={c.id} className="flex items-center text-[7.5px] leading-[1.85]">
            <span style={{ color: kindColor(c.kind), minWidth: '14px', flexShrink: 0 }}>▶</span>
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '200px', flexShrink: 0 }}>{c.id}</span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '72px', flexShrink: 0 }}>[{c.type}]</span>
            <span style={{ color: '#4ade80', minWidth: '70px', flexShrink: 0 }}>
              {c.id === 'journald' ? fmtRate(liveJournald) : fmtRate(c.eventsPs)} evt/s
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '70px', flexShrink: 0 }}>{fmtBytes(c.bytesPs)}/s</span>
            <span style={{ color: c.errorsPs > 0 ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
              {c.errorsPs > 0 ? `${c.errorsPs} err/s` : '0 err/s'}
            </span>
          </div>
        ))}

        {/* Transforms */}
        {revealed > xfmStart - 1 && (
          <div className="text-[7px] uppercase tracking-widest mt-1 mb-0.5" style={{ color: '#a78bfa', opacity: 0.5 }}>
            ── transforms
          </div>
        )}
        {shownXfm.map((c) => (
          <div key={c.id} className="flex items-center text-[7.5px] leading-[1.85]">
            <span style={{ color: kindColor(c.kind), minWidth: '14px', flexShrink: 0 }}>⟳</span>
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '200px', flexShrink: 0 }}>{c.id}</span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '72px', flexShrink: 0 }}>[{c.type}]</span>
            <span style={{ color: '#a78bfa', minWidth: '70px', flexShrink: 0 }}>{fmtRate(c.eventsPs)} evt/s</span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '70px', flexShrink: 0 }}>{fmtBytes(c.bytesPs)}/s</span>
            <span style={{ color: c.errorsPs > 0 ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
              {c.errorsPs > 0 ? `${c.errorsPs} err/s` : '0 err/s'}
            </span>
          </div>
        ))}

        {/* Sinks */}
        {revealed > sinkStart - 1 && (
          <div className="text-[7px] uppercase tracking-widest mt-1 mb-0.5" style={{ color: '#67e8f9', opacity: 0.5 }}>
            ── sinks
          </div>
        )}
        {shownSink.map((c) => (
          <div key={c.id} className="flex items-center text-[7.5px] leading-[1.85]">
            <span style={{ color: kindColor(c.kind), minWidth: '14px', flexShrink: 0 }}>◀</span>
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '200px', flexShrink: 0 }}>{c.id}</span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '72px', flexShrink: 0 }}>[{c.type}]</span>
            <span style={{ color: '#67e8f9', minWidth: '70px', flexShrink: 0 }}>
              {c.id === 'elasticsearch' ? fmtRate(liveElastic) : fmtRate(c.eventsPs)} evt/s
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '70px', flexShrink: 0 }}>{fmtBytes(c.bytesPs)}/s</span>
            <span style={{ color: c.errorsPs > 0 ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
              {c.errorsPs > 0 ? `${c.errorsPs} err/s` : '0 err/s'}
            </span>
          </div>
        ))}
      </div>

      {/* Tap stream */}
      {shownTap.length > 0 && (
        <div className="px-4 pt-2 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            vector tap — live event stream
          </div>
          {shownTap.map((e, i) => (
            <div key={i} className="text-[7.5px] leading-[1.8] flex items-start gap-2">
              <span style={{ color: 'rgba(240,239,255,0.18)', flexShrink: 0 }}>{e.ts}</span>
              <span style={{ color: tapKindColor(e.kind), flexShrink: 0 }}>[{e.kind}]</span>
              <span style={{ color: '#a78bfa', flexShrink: 0, minWidth: '130px' }}>{e.component}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', wordBreak: 'break-all' }}>{e.payload}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>2 sources</span>
          <span style={{ color: '#a78bfa' }}>3 transforms</span>
          <span style={{ color: '#67e8f9' }}>3 sinks</span>
          <span style={{ color: '#4ade80' }}>{fmtRate(totalEventsPs)} evt/s total</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          vector 0.41.1 · vrl 0.20.0 · sources: journald · file
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● pipeline healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
