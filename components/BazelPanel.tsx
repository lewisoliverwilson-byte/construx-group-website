'use client';

import { useEffect, useRef, useState } from 'react';

const TARGETS = [
  { label: '//api/gateway:server', lang: 'go', cached: true, dur: '0.8s', size: '24 MB', status: 'OK' },
  { label: '//ml/service:embed', lang: 'python', cached: false, dur: '42s', size: '180 MB', status: 'OK' },
  { label: '//web/app:bundle', lang: 'ts', cached: true, dur: '1.2s', size: '3.2 MB', status: 'OK' },
  { label: '//infra/k8s:deploy', lang: 'starlark', cached: false, dur: '8s', size: '1.8 MB', status: 'OK' },
  { label: '//api/auth:test', lang: 'go', cached: true, dur: '0.3s', size: '—', status: 'PASS' },
];

const CACHE_STATS = [
  { label: 'local hits', value: 1248, color: '#4ade80' },
  { label: 'remote hits', value: 840, color: '#67e8f9' },
  { label: 'misses', value: 124, color: '#fbbf24' },
  { label: 'evictions', value: 18, color: '#f87171' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function BazelPanel() {
  const [visible, setVisible] = useState(false);
  const [tgRows, setTgRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const actions = useCounter(48200, 20, 700);
  const hitRate = useCounter(91, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTgRows((x) => Math.min(x + 1, TARGETS.length)), 150);
    return () => clearInterval(t);
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
          bazel -- hermetic build -- remote cache / rbe
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {hitRate}% cache hit
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>bazel@monorepo</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>bazel build //... --remote_cache=grpc://buildcache:9090 --keep_going</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'actions', value: actions.toLocaleString(), color: '#4ade80' },
          { label: 'cache hit %', value: `${hitRate}%`, color: '#67e8f9' },
          { label: 'targets', value: TARGETS.length.toString(), color: '#a78bfa' },
          { label: 'parallelism', value: '16', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Build targets */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // build targets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TARGETS.slice(0, tgRows).map((tg) => (
            <div key={tg.label} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 32px 36px 44px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tg.label}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{tg.lang}</span>
              <span style={{ color: tg.cached ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{tg.cached ? 'HIT' : 'MISS'}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{tg.dur}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{tg.size}</span>
              <span style={{ color: tg.status === 'PASS' ? '#67e8f9' : '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{tg.status}</span>
            </div>
          ))}
        </div>

        {/* Cache stats */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // action cache stats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {CACHE_STATS.map((cs) => (
            <div key={cs.label} style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{cs.label}</span>
                <span className="tabular-nums" style={{ color: cs.color, fontSize: 9, fontWeight: 700 }}>{cs.value.toLocaleString()}</span>
              </div>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${(cs.value / 1300) * 100}%`, background: cs.color, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          bazel 7.2 - apache 2.0 - starlark build lang
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {actions.toLocaleString()} actions - {hitRate}% hit rate
        </span>
      </div>
    </div>
  );
}
