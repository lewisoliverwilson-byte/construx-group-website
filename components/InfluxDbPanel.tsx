'use client';

import { useEffect, useRef, useState } from 'react';

const BUCKETS = [
  { name: 'construx_metrics', org: 'construx', retention: '30d', size: '8.4 GB', series: 28400 },
  { name: 'construx_logs', org: 'construx', retention: '7d', size: '2.1 GB', series: 4200 },
  { name: 'construx_traces', org: 'construx', retention: '3d', size: '640 MB', series: 1200 },
  { name: '_monitoring', org: '_internal', retention: '168h', size: '84 MB', series: 84 },
];

const QUERIES = [
  { name: 'api_p99_latency', flux: 'from(bucket:"construx_metrics") |> range(start:-1h) |> filter(fn:(r) => r._measurement == "http")', duration: '48ms', points: 2840 },
  { name: 'error_rate_5m', flux: 'from(bucket:"construx_metrics") |> range(start:-5m) |> aggregateWindow(every:1m, fn:mean)', duration: '12ms', points: 284 },
  { name: 'disk_io_top5', flux: 'from(bucket:"construx_metrics") |> range(start:-1h) |> top(n:5, columns:["_value"])', duration: '8ms', points: 5 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function InfluxDbPanel() {
  const [visible, setVisible] = useState(false);
  const [bRows, setBRows] = useState(0);
  const [qRows, setQRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const writeRate = useCounter(28400, 180, 400);
  const queryRate = useCounter(2840, 12, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const b = setInterval(() => setBRows((x) => Math.min(x + 1, BUCKETS.length)), 160);
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(b); clearInterval(q); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          influxdb -- time series database -- flux query language
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {writeRate.toLocaleString()} writes/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>influx@tsdb</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>influx bucket list && influx query 'from(bucket:"construx_metrics") |> range(start:-1h)'</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'writes/s', value: writeRate.toLocaleString(), color: '#67e8f9' },
          { label: 'queries/s', value: queryRate.toLocaleString(), color: '#4ade80' },
          { label: 'buckets', value: BUCKETS.length.toString(), color: '#a78bfa' },
          { label: 'series', value: BUCKETS.reduce((a, b) => a + b.series, 0).toLocaleString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Buckets */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // buckets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {BUCKETS.slice(0, bRows).map((b) => (
            <div key={b.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 28px 52px 56px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{b.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{b.org}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{b.retention}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{b.size}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{b.series.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Flux queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // flux queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, qRows).map((q) => (
            <div key={q.name} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 36px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{q.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.flux}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{q.duration}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.points.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          influxdb v3 - mit - time series database
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {writeRate.toLocaleString()} writes/s - {queryRate.toLocaleString()} queries/s
        </span>
      </div>
    </div>
  );
}
