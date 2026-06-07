'use client';

import { useEffect, useRef, useState } from 'react';

const STREAMS = [
  { selector: '{app="api"}', bytes: '2.4 GB/d', lines: 4820000, retention: '30d', compressed: '180 MB' },
  { selector: '{app="worker"}', bytes: '840 MB/d', lines: 1240000, retention: '30d', compressed: '64 MB' },
  { selector: '{level="error"}', bytes: '12 MB/d', lines: 8400, retention: '90d', compressed: '0.9 MB' },
  { selector: '{app="gateway"}', bytes: '1.2 GB/d', lines: 2480000, retention: '14d', compressed: '96 MB' },
];

const QUERIES = [
  { query: '{app="api"} |= "error"', hits: 284, latency: '4ms', ts: '1m ago' },
  { query: '{level="error"} | json | count()', hits: 42, latency: '2ms', ts: '3m ago' },
  { query: '{app="worker"} | duration > 5s', hits: 18, latency: '8ms', ts: '6m ago' },
  { query: '{app="api"} | json | status=~"5.."', hits: 7, latency: '6ms', ts: '12m ago' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function VictoriaLogsPanel() {
  const [visible, setVisible] = useState(false);
  const [sRows, setSRows] = useState(0);
  const [qRows, setQRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ingestRate = useCounter(2840, 28, 600);
  const totalLines = useCounter(8540000, 280, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, STREAMS.length)), 160);
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(s); clearInterval(q); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          victorialogs -- fast log management -- logsql / loki compat
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ingestRate.toLocaleString()} lines/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>vlogs@logs</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>logcli --addr http://vlogs:9428 query '{`{app="api"}`} |= "error" | count()'</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'lines/s', value: ingestRate.toLocaleString(), color: '#f97316' },
          { label: 'total lines', value: totalLines.toLocaleString(), color: '#4ade80' },
          { label: 'streams', value: STREAMS.length.toString(), color: '#a78bfa' },
          { label: 'query lat p99', value: '8ms', color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Streams */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // log streams
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {STREAMS.slice(0, sRows).map((s) => (
            <div key={s.selector} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 56px 36px 56px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.selector}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{s.bytes}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{s.lines.toLocaleString()}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{s.retention}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{s.compressed}</span>
            </div>
          ))}
        </div>

        {/* Recent queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, qRows).map((q) => (
            <div key={q.query} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 32px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'center' }}>{q.hits}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'center' }}>{q.latency}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{q.ts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          victorialogs v0.28 - apache 2.0 - victoriametrics
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalLines.toLocaleString()} lines - {ingestRate.toLocaleString()} /s
        </span>
      </div>
    </div>
  );
}
