'use client';

import { useEffect, useRef, useState } from 'react';

const STREAMS = [
  { labels: '{namespace="prod",app="construx-api"}', lines: 284000, bytesRate: '2.4MB/s', compressRatio: '8.4x', ingester: 'ingester-01', status: 'active' },
  { labels: '{namespace="prod",app="construx-worker"}', lines: 184000, bytesRate: '1.2MB/s', compressRatio: '7.8x', ingester: 'ingester-02', status: 'active' },
  { labels: '{namespace="prod",app="construx-web"}', lines: 48000, bytesRate: '480KB/s', compressRatio: '6.2x', ingester: 'ingester-01', status: 'active' },
  { labels: '{namespace="kube-system",app="kube-apiserver"}', lines: 28000, bytesRate: '240KB/s', compressRatio: '9.1x', ingester: 'ingester-03', status: 'active' },
];

const QUERIES = [
  { query: '{app="construx-api"} |= "ERROR"', duration: '48ms', lines: 28, cached: true, status: 'ok' },
  { query: '{namespace="prod"} | json | level="warn"', duration: '124ms', lines: 184, cached: false, status: 'ok' },
  { query: '{app="construx-worker"} | logfmt | duration > 1s', duration: '84ms', lines: 12, cached: true, status: 'ok' },
  { query: 'sum(rate({app="construx-api"}[5m])) by (level)', duration: '212ms', lines: 4, cached: false, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function LokiPanel() {
  const [visible, setVisible] = useState(false);
  const [streamRows, setStreamRows] = useState(0);
  const [queryRows, setQueryRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const linesPerSec = useCounter(28400, 480, 400);
  const bytesIngested = useCounter(4840000000, 48000, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setStreamRows((x) => Math.min(x + 1, STREAMS.length)), 160);
    const q = setInterval(() => setQueryRows((x) => Math.min(x + 1, QUERIES.length)), 140);
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
          grafana loki -- log aggregation -- streams / logql / ingester
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {linesPerSec.toLocaleString()} lines/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>logcli@loki</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>logcli query '{`{app="construx-api"}`} |= "ERROR" | logfmt' --limit=100 --since=1h</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'lines / sec', value: linesPerSec.toLocaleString(), color: '#f97316' },
          { label: 'bytes ingested', value: (bytesIngested / 1000000000).toFixed(1) + 'GB', color: '#4ade80' },
          { label: 'streams', value: STREAMS.length.toString(), color: '#67e8f9' },
          { label: 'ingesters', value: '3', color: '#a78bfa' },
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
          {STREAMS.slice(0, streamRows).map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 36px 64px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.labels}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{s.bytesRate}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{s.compressRatio}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{s.ingester}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{s.status}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, queryRows).map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 24px 32px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
              <span className="tabular-nums" style={{ color: Number(q.duration.replace('ms','')) > 100 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.duration}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{q.lines}</span>
              <span style={{ color: q.cached ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{q.cached ? 'hit' : 'miss'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          grafana loki v3.2 - agpl-3.0 - like prometheus, but for logs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {linesPerSec.toLocaleString()} lines/s - {(bytesIngested / 1000000000).toFixed(1)}GB
        </span>
      </div>
    </div>
  );
}
