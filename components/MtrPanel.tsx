'use client';

import { useState, useEffect, useRef } from 'react';

interface HopEntry {
  hop:   number;
  host:  string;
  loss:  number;
  snt:   number;
  last:  number;
  avg:   number;
  best:  number;
  wrst:  number;
  stdev: number;
}

const HOPS: HopEntry[] = [
  { hop:  1, host: '10.0.0.1',                      loss:  0.0, snt: 10, last:  0.8, avg:  0.9, best:  0.7, wrst:  1.2, stdev: 0.1 },
  { hop:  2, host: '100.64.0.1',                     loss:  0.0, snt: 10, last:  1.4, avg:  1.6, best:  1.2, wrst:  2.1, stdev: 0.2 },
  { hop:  3, host: 'ae-4.r02.londen01.uk.bb.gin.ntt.net', loss: 0.0, snt: 10, last: 3.2, avg: 3.4, best: 3.1, wrst: 4.0, stdev: 0.3 },
  { hop:  4, host: 'ae-6.r21.londen01.uk.bb.gin.ntt.net', loss: 0.0, snt: 10, last: 3.8, avg: 4.1, best: 3.7, wrst: 5.2, stdev: 0.4 },
  { hop:  5, host: 'ae-5.r20.parisfr01.fr.bb.gin.ntt.net', loss: 0.0, snt: 10, last: 7.3, avg: 7.6, best: 7.1, wrst: 8.9, stdev: 0.5 },
  { hop:  6, host: 'xe-0-2-0.r20.parisfr01.fr.ce.gin.ntt.net', loss: 0.0, snt: 10, last: 8.1, avg: 8.4, best: 7.9, wrst: 9.8, stdev: 0.6 },
  { hop:  7, host: 'cloudflare-ntt.parisfr01.fr.bb.gin.ntt.net', loss: 0.0, snt: 10, last: 8.8, avg: 9.2, best: 8.6, wrst: 11.3, stdev: 0.8 },
  { hop:  8, host: '104.28.20.4',                    loss:  0.0, snt: 10, last:  8.3, avg:  8.7, best:  8.1, wrst: 10.4, stdev: 0.7 },
  { hop:  9, host: 'construxgroup.io',               loss:  0.0, snt: 10, last:  8.6, avg:  9.0, best:  8.4, wrst: 10.8, stdev: 0.8 },
];

function lossColor(loss: number): string {
  if (loss === 0)    return 'rgba(74,222,128,0.7)';
  if (loss  < 5)     return '#fbbf24';
  if (loss  < 20)    return '#f97316';
  return '#f87171';
}

function latColor(ms: number): string {
  if (ms  < 5)    return 'rgba(74,222,128,0.8)';
  if (ms  < 20)   return '#67e8f9';
  if (ms  < 80)   return '#fbbf24';
  return '#f87171';
}

function latBar(ms: number): string {
  const filled = Math.min(Math.round(ms / 5), 10);
  return '▌'.repeat(filled) + '·'.repeat(Math.max(0, 10 - filled));
}

export default function MtrPanel() {
  const [revealed, setRevealed] = useState(0);
  const [jitter, setJitter]     = useState<number[]>(HOPS.map((h) => h.last));
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
    if (revealed === 0 || revealed > HOPS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 120);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= HOPS.length) return;
    const id = setInterval(() => {
      setJitter(HOPS.map((h) => {
        const delta = (Math.random() - 0.4) * h.avg * 0.25;
        return Math.max(0.1, parseFloat((h.last + delta).toFixed(1)));
      }));
    }, 1800);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone  = revealed > HOPS.length;
  const displayed = HOPS.slice(0, allDone ? HOPS.length : revealed);
  const finalHop  = displayed[displayed.length - 1];

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
          construx@sys — mtr construxgroup.io
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${HOPS.length} hops · live` : 'probing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          mtr --report-wide --no-dns construxgroup.io
        </span>
      </div>

      {/* Header line */}
      {revealed > 0 && (
        <div className="px-4 pt-2 pb-0.5 text-[8px] select-none" style={{ color: 'rgba(240,239,255,0.18)' }}>
          <span className="mr-3">Start: {new Date().toUTCString().slice(0, 25)}</span>
          <span>HOST: construx-sys</span>
        </div>
      )}

      {/* Column headers */}
      {revealed > 0 && (
        <div className="px-4 pb-0.5 text-[8px] flex gap-0 select-none" style={{ color: 'rgba(240,239,255,0.2)' }}>
          <span style={{ minWidth: '24px' }}>HOP</span>
          <span style={{ minWidth: '220px' }}>HOST</span>
          <span style={{ minWidth: '44px' }}>LOSS%</span>
          <span style={{ minWidth: '32px' }}>SNT</span>
          <span style={{ minWidth: '52px' }}>LAST</span>
          <span style={{ minWidth: '52px' }}>AVG</span>
          <span style={{ minWidth: '52px' }}>BEST</span>
          <span style={{ minWidth: '52px' }}>WRST</span>
          <span style={{ minWidth: '52px' }}>STDEV</span>
          <span>GRAPH</span>
        </div>
      )}

      {/* Hop rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {displayed.map((hop, i) => {
          const live = jitter[i] ?? hop.last;
          const isLast = hop.hop === HOPS.length;
          return (
            <div key={i} className="flex items-center gap-0 text-[8px] leading-[1.65]">
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '24px', flexShrink: 0 }}>
                {hop.hop}
              </span>
              <span
                style={{
                  color:      isLast ? '#4ade80' : 'rgba(240,239,255,0.42)',
                  minWidth:   '220px',
                  flexShrink: 0,
                  overflow:   'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: isLast ? 700 : 400,
                }}
              >
                {hop.host}
              </span>
              <span style={{ color: lossColor(hop.loss), minWidth: '44px', flexShrink: 0 }}>
                {hop.loss.toFixed(1)}%
              </span>
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '32px', flexShrink: 0 }}>
                {hop.snt}
              </span>
              <span style={{ color: latColor(live), minWidth: '52px', flexShrink: 0 }}>
                {live.toFixed(1)}ms
              </span>
              <span style={{ color: latColor(hop.avg), minWidth: '52px', flexShrink: 0 }}>
                {hop.avg.toFixed(1)}ms
              </span>
              <span style={{ color: 'rgba(74,222,128,0.6)', minWidth: '52px', flexShrink: 0 }}>
                {hop.best.toFixed(1)}ms
              </span>
              <span style={{ color: '#f87171', minWidth: '52px', flexShrink: 0 }}>
                {hop.wrst.toFixed(1)}ms
              </span>
              <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '52px', flexShrink: 0 }}>
                {hop.stdev.toFixed(1)}ms
              </span>
              <span style={{ color: latColor(live), letterSpacing: '-1px' }}>
                {latBar(live)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          mtr 0.95 · {HOPS.length} hops · 10 samples · destination {allDone ? finalHop?.host : '—'}
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'probing'}
        </span>
      </div>
    </div>
  );
}
