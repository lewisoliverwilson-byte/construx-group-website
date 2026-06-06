'use client';

import { useState, useEffect, useRef } from 'react';

interface Route {
  path:        string;
  type:        'static' | 'dynamic' | 'isr';
  sizeKb:      number;
  firstLoadKb: number;
  accent:      string;
}

const BASE_ROUTES: Route[] = [
  { path: '/',              type: 'static',  sizeKb:  14.2, firstLoadKb: 114.2, accent: '#F97316' },
  { path: '/journal',       type: 'static',  sizeKb:  22.8, firstLoadKb: 122.8, accent: '#67e8f9' },
  { path: '/journal/[slug]',type: 'isr',     sizeKb:   8.4, firstLoadKb: 108.4, accent: '#67e8f9' },
  { path: '/manifesto',     type: 'static',  sizeKb:  31.6, firstLoadKb: 131.6, accent: '#a78bfa' },
  { path: '/founders',      type: 'static',  sizeKb:  19.1, firstLoadKb: 119.1, accent: '#4ade80' },
  { path: '/contact',       type: 'dynamic', sizeKb:  11.8, firstLoadKb: 111.8, accent: '#fbbf24' },
  { path: '/work-with-us',  type: 'static',  sizeKb:  28.4, firstLoadKb: 128.4, accent: '#67e8f9' },
  { path: '/uses',          type: 'static',  sizeKb:  17.2, firstLoadKb: 117.2, accent: '#4ade80' },
];

const SHARED_JS_KB = 100.0;

function sizeColor(kb: number) {
  if (kb < 80)  return '#4ade80';
  if (kb < 150) return '#fbbf24';
  if (kb < 300) return '#F97316';
  return '#f87171';
}

function typeColor(type: Route['type']) {
  if (type === 'static')  return '#4ade80';
  if (type === 'isr')     return '#67e8f9';
  if (type === 'dynamic') return '#fbbf24';
  return 'rgba(240,239,255,0.3)';
}

export default function BundleAnalysisPanel() {
  const [revealed, setRevealed]         = useState(0);
  const [sizes, setSizes]               = useState(BASE_ROUTES.map((r) => r.sizeKb));
  const [firstLoads, setFirstLoads]     = useState(BASE_ROUTES.map((r) => r.firstLoadKb));
  const ref     = useRef<HTMLDivElement>(null);
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
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE_ROUTES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setSizes(BASE_ROUTES.map((r) => parseFloat((r.sizeKb + (Math.random() - 0.5) * 0.4).toFixed(1))));
      setFirstLoads(BASE_ROUTES.map((r) => parseFloat((r.firstLoadKb + (Math.random() - 0.5) * 0.4).toFixed(1))));
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const allDone      = revealed > BASE_ROUTES.length;
  const totalFirstLoad = firstLoads.reduce((s, v) => s + v, 0) / firstLoads.length;

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
          construx@sys — bundle analysis
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.6)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${BASE_ROUTES.length} routes` : 'building…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          next build --turbopack 2&gt;&amp;1 | grep &apos;Route\|chunks\|First Load&apos;
        </span>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-3 px-4 py-1 text-[7px] uppercase tracking-widest select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
      >
        <span style={{ minWidth: '176px', flexShrink: 0 }}>ROUTE</span>
        <span style={{ minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>SIZE</span>
        <span style={{ minWidth: '80px', flexShrink: 0, textAlign: 'right' }}>FIRST LOAD JS</span>
        <span style={{ paddingLeft: '12px' }}>TYPE</span>
      </div>

      {/* Route rows */}
      <div className="px-4 py-2 space-y-1.5">
        {BASE_ROUTES.slice(0, revealed).map((r, i) => (
          <div key={i} className="flex items-center gap-3 text-[8px] tabular-nums">
            <span style={{ color: r.accent, minWidth: '176px', flexShrink: 0, fontWeight: 500 }}>
              {r.path}
            </span>
            <span style={{ color: sizeColor(sizes[i] ?? r.sizeKb), minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>
              {(sizes[i] ?? r.sizeKb).toFixed(1)} kB
            </span>
            <span style={{ color: sizeColor(firstLoads[i] ?? r.firstLoadKb), minWidth: '80px', flexShrink: 0, textAlign: 'right', fontWeight: 600 }}>
              {(firstLoads[i] ?? r.firstLoadKb).toFixed(1)} kB
            </span>
            <span style={{ color: typeColor(r.type), paddingLeft: '12px' }}>
              {r.type}
            </span>
          </div>
        ))}

        {allDone && (
          <div
            className="flex items-center gap-3 text-[8px] tabular-nums mt-2 pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '176px', flexShrink: 0 }}>
              + First Load JS shared
            </span>
            <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>
              —
            </span>
            <span style={{ color: sizeColor(SHARED_JS_KB), minWidth: '80px', flexShrink: 0, textAlign: 'right', fontWeight: 600 }}>
              {SHARED_JS_KB.toFixed(1)} kB
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', paddingLeft: '12px' }}>
              shared
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          next 15.3 · turbopack · {BASE_ROUTES.length} routes · avg {totalFirstLoad.toFixed(1)} kB
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          ✓ compiled
        </span>
      </div>
    </div>
  );
}
