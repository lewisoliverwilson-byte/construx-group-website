'use client';

import { useState, useEffect, useRef } from 'react';

interface HarEntry {
  order:       number;
  url:         string;
  type:        string;
  size:        string;
  time:        number;
  start:       number;
  ttfb:        number;
  cached:      boolean;
  status:      number;
}

const ENTRIES: HarEntry[] = [
  { order:  1, url: '/',                                      type: 'document', size: '14.2 KB',  time:  42, start:  0, ttfb:  38, cached: false, status: 200 },
  { order:  2, url: '/_next/static/css/app.css',              type: 'css',      size:  '8.4 KB',  time:  18, start: 15, ttfb:  12, cached: false, status: 200 },
  { order:  3, url: '/_next/static/js/main.js',               type: 'script',   size: '42.1 KB',  time:  55, start: 15, ttfb:  14, cached: false, status: 200 },
  { order:  4, url: '/_next/static/js/react.js',              type: 'script',   size: '11.8 KB',  time:   8, start: 15, ttfb:   5, cached: true,  status: 200 },
  { order:  5, url: '/fonts/JetBrainsMono.woff2',             type: 'font',     size: '48.0 KB',  time:  28, start: 30, ttfb:  24, cached: false, status: 200 },
  { order:  6, url: '/fonts/SpaceGrotesk.woff2',              type: 'font',     size: '22.4 KB',  time:  21, start: 30, ttfb:  17, cached: false, status: 200 },
  { order:  7, url: '/api/og?page=home',                      type: 'image',    size:  '9.8 KB',  time:  88, start: 42, ttfb:  82, cached: false, status: 200 },
  { order:  8, url: '/_next/static/chunks/three.js',          type: 'script',   size: '156.0 KB', time: 120, start: 55, ttfb:  18, cached: false, status: 200 },
  { order:  9, url: '/images/hero-grid.svg',                  type: 'image',    size:  '2.1 KB',  time:  12, start: 70, ttfb:   9, cached: true,  status: 200 },
  { order: 10, url: '/_next/data/home.json',                  type: 'fetch',    size:  '3.4 KB',  time:  24, start: 75, ttfb:  20, cached: false, status: 200 },
  { order: 11, url: 'https://www.googletagmanager.com/gtm.js', type: 'script',  size: '28.3 KB',  time:  44, start: 80, ttfb:  38, cached: false, status: 200 },
  { order: 12, url: '/api/health',                            type: 'fetch',    size:  '0.1 KB',  time:   6, start: 90, ttfb:   4, cached: false, status: 200 },
];

const MAX_TIME = Math.max(...ENTRIES.map((e) => e.start + e.time));

function typeColor(type: string): string {
  if (type === 'document') return '#f97316';
  if (type === 'css')      return '#a78bfa';
  if (type === 'script')   return '#fbbf24';
  if (type === 'font')     return '#67e8f9';
  if (type === 'image')    return '#4ade80';
  if (type === 'fetch')    return '#60a5fa';
  return 'rgba(240,239,255,0.3)';
}

function timeColor(ms: number): string {
  if (ms < 20)  return '#4ade80';
  if (ms < 60)  return '#fbbf24';
  if (ms < 120) return '#f97316';
  return '#f87171';
}

function waterfall(entry: HarEntry): { left: string; width: string; ttfbWidth: string } {
  const left      = `${((entry.start / MAX_TIME) * 100).toFixed(1)}%`;
  const width     = `${((entry.time / MAX_TIME) * 100).toFixed(1)}%`;
  const ttfbWidth = `${((entry.ttfb / entry.time) * 100).toFixed(1)}%`;
  return { left, width, ttfbWidth };
}

function truncUrl(url: string): string {
  if (url.length <= 42) return url;
  const path = url.replace(/^https?:\/\/[^/]+/, '');
  if (path.length <= 42) return path;
  return '…' + path.slice(-40);
}

export default function HttpArchivePanel() {
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
    if (revealed === 0 || revealed > ENTRIES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone   = revealed > ENTRIES.length;
  const displayed = ENTRIES.slice(0, allDone ? ENTRIES.length : revealed);
  const totalSize = displayed.reduce((s, e) => s + parseFloat(e.size), 0);
  const totalTime = displayed.length > 0 ? Math.max(...displayed.map((e) => e.start + e.time)) : 0;
  const cached    = displayed.filter((e) => e.cached).length;

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
          construx@sys — har-viewer construxgroup.io
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${totalTime}ms · ${cached} cached` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          har-viewer --url construxgroup.io --show-waterfall
        </span>
      </div>

      {/* Column headers */}
      {revealed > 0 && (
        <div className="px-4 pt-2 pb-0.5 text-[8px] flex gap-0 select-none" style={{ color: 'rgba(240,239,255,0.2)' }}>
          <span style={{ minWidth: '20px' }}>#</span>
          <span style={{ minWidth: '48px' }}>TYPE</span>
          <span style={{ minWidth: '288px' }}>URL</span>
          <span style={{ minWidth: '52px' }}>SIZE</span>
          <span style={{ minWidth: '48px' }}>TIME</span>
          <span style={{ minWidth: '16px' }}>✓</span>
          <span>WATERFALL</span>
        </div>
      )}

      {/* Request rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {displayed.map((entry, i) => {
          const wf = waterfall(entry);
          return (
            <div key={i} className="flex items-center gap-0 text-[8px] leading-[1.65]">
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '20px', flexShrink: 0 }}>
                {entry.order}
              </span>
              <span style={{ color: typeColor(entry.type), minWidth: '48px', flexShrink: 0, fontWeight: 700 }}>
                {entry.type.slice(0, 4)}
              </span>
              <span
                style={{
                  color:      entry.cached ? 'rgba(240,239,255,0.3)' : 'rgba(240,239,255,0.55)',
                  minWidth:   '288px',
                  flexShrink: 0,
                  overflow:   'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {truncUrl(entry.url)}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '52px', flexShrink: 0 }}>
                {entry.size}
              </span>
              <span style={{ color: timeColor(entry.time), minWidth: '48px', flexShrink: 0, fontWeight: 700 }}>
                {entry.time}ms
              </span>
              <span style={{ color: entry.cached ? '#67e8f9' : 'rgba(240,239,255,0.1)', minWidth: '16px', flexShrink: 0 }}>
                {entry.cached ? '↯' : ' '}
              </span>
              {/* Waterfall bar */}
              <div style={{ position: 'relative', width: '120px', height: '8px', background: 'rgba(255,255,255,0.04)', flexShrink: 0, borderRadius: '1px' }}>
                <div style={{
                  position:   'absolute',
                  left:       wf.left,
                  width:      wf.width,
                  height:     '100%',
                  background: `${typeColor(entry.type)}40`,
                  borderRadius: '1px',
                }}>
                  <div style={{
                    width:      wf.ttfbWidth,
                    height:     '100%',
                    background: typeColor(entry.type),
                    borderRadius: '1px',
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-6 px-4 py-1.5 select-none text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.3)' }}>{ENTRIES.length} requests</span>
          <span style={{ color: timeColor(totalTime) }}>{totalTime}ms</span>
          <span style={{ color: 'rgba(240,239,255,0.3)' }}>{totalSize.toFixed(0)} KB transferred</span>
          <span style={{ color: '#67e8f9' }}>{cached} cached (↯)</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {ENTRIES.length} reqs · {cached} cached · construxgroup.io · har 1.2
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● done' : 'loading'}
        </span>
      </div>
    </div>
  );
}
