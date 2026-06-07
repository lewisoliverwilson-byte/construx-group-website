'use client';

import { useEffect, useRef, useState } from 'react';

const REPLAYS = [
  { name: 'prod-to-staging', source: 'construxgroup.io:443', target: 'staging.construxgroup.io:443', rate: '10%', requests: 28400, multiplier: '0.1x', status: 'active' },
  { name: 'prod-shadow', source: 'construxgroup.io:443', target: 'construx-new:8080', rate: '100%', requests: 284000, multiplier: '1x', status: 'active' },
  { name: 'stress-test', source: 'traffic.pcap', target: 'construx-new:8080', rate: '1000%', requests: 2840000, multiplier: '10x', status: 'paused' },
];

const STATS = [
  { endpoint: 'GET /listings', captured: 28400, replayed: 28400, matched: 28398, diverged: 2, status: 'OK' },
  { endpoint: 'POST /search', captured: 12000, replayed: 12000, matched: 11994, diverged: 6, status: 'OK' },
  { endpoint: 'GET /listing/:id', captured: 48200, replayed: 48200, matched: 48199, diverged: 1, status: 'OK' },
  { endpoint: 'POST /checkout', captured: 840, replayed: 840, matched: 836, diverged: 4, status: 'WARN' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GoReplayPanel() {
  const [visible, setVisible] = useState(false);
  const [rRows, setRRows] = useState(0);
  const [stRows, setStRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reqPerSec = useCounter(28400, 120, 500);
  const totalReplayed = useCounter(2840000, 480, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRRows((x) => Math.min(x + 1, REPLAYS.length)), 160);
    const s = setInterval(() => setStRows((x) => Math.min(x + 1, STATS.length)), 140);
    return () => { clearInterval(r); clearInterval(s); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(74,222,128,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(74,222,128,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(74,222,128,0.08)', background: 'rgba(74,222,128,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)' }}>
          goreplay -- http traffic replay -- shadow / shadow-test / rate control
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>gor@replay</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>gor --input-raw :443 --output-http https://staging.construxgroup.io --output-http-track-response --http-pprof :8181</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req/s', value: reqPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'replayed', value: (totalReplayed / 1000000).toFixed(1) + 'M', color: '#67e8f9' },
          { label: 'replays', value: REPLAYS.length.toString(), color: '#a78bfa' },
          { label: 'diverged', value: STATS.reduce((a, s) => a + s.diverged, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Replays */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // replay configs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {REPLAYS.slice(0, rRows).map((rp) => (
            <div key={rp.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 32px 48px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: rp.status === 'paused' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${rp.status === 'paused' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{rp.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rp.target}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{rp.multiplier}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{(rp.requests / 1000).toFixed(0)}k</span>
              <span style={{ color: rp.status === 'active' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{rp.status}</span>
            </div>
          ))}
        </div>

        {/* Endpoint stats */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // endpoint comparison
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STATS.slice(0, stRows).map((st) => (
            <div key={st.endpoint} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 48px 32px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: st.status === 'WARN' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${st.status === 'WARN' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.endpoint}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{(st.captured / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(st.matched / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: st.diverged > 2 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{st.diverged}</span>
              <span style={{ color: st.status === 'OK' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{st.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          goreplay v2.0 - lgpl-3.0 - http traffic replay
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s - {(totalReplayed / 1000000).toFixed(1)}M replayed
        </span>
      </div>
    </div>
  );
}
