'use client';

import { useState, useEffect, useRef } from 'react';

interface BuildStep {
  step:     number;
  total:    number;
  name:     string;
  cached:   boolean;
  duration: string;
  size?:    string;
  type:     'FROM' | 'RUN' | 'COPY' | 'ARG' | 'ENV' | 'WORKDIR' | 'EXPOSE' | 'CMD' | 'LABEL';
}

const STEPS: BuildStep[] = [
  { step:  1, total: 18, name: 'FROM node:22-alpine AS base',                 cached: true,  duration: '0.0s', type: 'FROM',    size: '179 MB' },
  { step:  2, total: 18, name: 'ARG NODE_ENV=production',                      cached: true,  duration: '0.0s', type: 'ARG' },
  { step:  3, total: 18, name: 'WORKDIR /app',                                 cached: true,  duration: '0.0s', type: 'WORKDIR' },
  { step:  4, total: 18, name: 'FROM base AS deps',                            cached: true,  duration: '0.0s', type: 'FROM' },
  { step:  5, total: 18, name: 'COPY package.json bun.lockb ./',               cached: true,  duration: '0.1s', type: 'COPY' },
  { step:  6, total: 18, name: 'RUN bun install --frozen-lockfile',            cached: false, duration: '4.2s', type: 'RUN',    size: '412 MB' },
  { step:  7, total: 18, name: 'FROM base AS builder',                         cached: true,  duration: '0.0s', type: 'FROM' },
  { step:  8, total: 18, name: 'COPY --from=deps /app/node_modules ./node_modules', cached: true, duration: '0.8s', type: 'COPY' },
  { step:  9, total: 18, name: 'COPY . .',                                     cached: false, duration: '0.3s', type: 'COPY' },
  { step: 10, total: 18, name: 'RUN bun run build',                            cached: false, duration: '38.4s', type: 'RUN',   size: '68 MB' },
  { step: 11, total: 18, name: 'FROM base AS runner',                          cached: true,  duration: '0.0s', type: 'FROM' },
  { step: 12, total: 18, name: 'ENV NODE_ENV=production',                      cached: true,  duration: '0.0s', type: 'ENV' },
  { step: 13, total: 18, name: 'ENV PORT=3000 HOSTNAME=0.0.0.0',              cached: true,  duration: '0.0s', type: 'ENV' },
  { step: 14, total: 18, name: 'RUN addgroup --system nodejs && adduser --system nextjs', cached: true, duration: '0.4s', type: 'RUN' },
  { step: 15, total: 18, name: 'COPY --from=builder /app/public ./public',     cached: false, duration: '0.1s', type: 'COPY' },
  { step: 16, total: 18, name: 'COPY --from=builder /app/.next/standalone ./', cached: false, duration: '0.6s', type: 'COPY' },
  { step: 17, total: 18, name: 'EXPOSE 3000',                                  cached: true,  duration: '0.0s', type: 'EXPOSE' },
  { step: 18, total: 18, name: 'CMD ["node","server.js"]',                     cached: true,  duration: '0.0s', type: 'CMD' },
];

const PUSH_LAYERS = [
  { digest: 'sha256:a3b4c5d6e7f8', size: '3.2 MB',  status: 'Pushed' },
  { digest: 'sha256:1a2b3c4d5e6f', size: '48.1 MB', status: 'Pushed' },
  { digest: 'sha256:9f8e7d6c5b4a', size: '12.4 MB', status: 'Pushed' },
  { digest: 'sha256:0d1e2f3a4b5c', size: '4.8 MB',  status: 'Mounted' },
  { digest: 'sha256:f6e5d4c3b2a1', size: '1.1 MB',  status: 'Pushed' },
];

function typeColor(t: BuildStep['type']): string {
  if (t === 'FROM')    return '#60a5fa';
  if (t === 'RUN')     return '#f97316';
  if (t === 'COPY')    return '#fbbf24';
  if (t === 'ARG' || t === 'ENV') return '#a78bfa';
  if (t === 'EXPOSE' || t === 'CMD') return '#4ade80';
  return 'rgba(240,239,255,0.35)';
}

const TOTAL = STEPS.length + PUSH_LAYERS.length;

export default function DockerBuildPanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveSize, setLiveSize]  = useState('69.6 MB');
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 78);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const id = setInterval(() => {
      const mb = (69 + Math.random() * 2).toFixed(1);
      setLiveSize(`${mb} MB`);
    }, 2800);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone = revealed > TOTAL;

  const shownSteps  = STEPS.slice(0, Math.max(0, Math.min(STEPS.length, revealed)));
  const shownLayers = PUSH_LAYERS.slice(0, Math.max(0, Math.min(PUSH_LAYERS.length, revealed - STEPS.length)));

  const cachedCount = STEPS.filter((s) => s.cached).length;
  const builtCount  = STEPS.filter((s) => !s.cached).length;
  const totalDuration = STEPS.reduce((sum, s) => sum + parseFloat(s.duration), 0).toFixed(1);

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
          construx@sys — docker buildx build
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? liveSize : 'building…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          docker buildx build --platform linux/amd64 -t ghcr.io/construx/website:latest --push .
        </span>
      </div>

      {/* Build steps */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownSteps.map((s, i) => (
          <div key={i} className="flex items-start text-[8px] leading-[1.65] gap-1.5">
            <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '44px', flexShrink: 0 }}>
              [{String(s.step).padStart(2, ' ')}/{s.total}]
            </span>
            <span style={{ color: s.cached ? 'rgba(74,222,128,0.3)' : 'rgba(74,222,128,0.7)', minWidth: '12px', flexShrink: 0 }}>
              {s.cached ? '✓' : '▶'}
            </span>
            <span style={{ color: typeColor(s.type), minWidth: '56px', flexShrink: 0, fontWeight: 700 }}>
              {s.type}
            </span>
            <span style={{ color: s.cached ? 'rgba(240,239,255,0.28)' : 'rgba(240,239,255,0.55)', flex: 1, minWidth: 0 }}>
              {s.name}
            </span>
            <span style={{ color: s.cached ? 'rgba(240,239,255,0.15)' : '#fbbf24', minWidth: '36px', flexShrink: 0, textAlign: 'right' }}>
              {s.cached ? 'CACHED' : s.duration}
            </span>
            {s.size && (
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>
                {s.size}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Push layers */}
      {shownLayers.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — pushing to ghcr.io/construx/website:latest
          </div>
          {shownLayers.map((l, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-3">
              <span style={{ color: 'rgba(240,239,255,0.25)' }}>{l.digest}</span>
              <span style={{ color: l.status === 'Pushed' ? '#4ade80' : '#60a5fa' }}>{l.status}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', marginLeft: 'auto' }}>{l.size}</span>
            </div>
          ))}
        </div>
      )}

      {/* Cursor */}
      {allDone && (
        <div className="px-4 text-[8px]" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-4 px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{cachedCount} cached</span>
          <span style={{ color: '#fbbf24' }}>{builtCount} built</span>
          <span>{totalDuration}s total</span>
          <span className="ml-auto" style={{ color: '#4ade80' }}>✓ pushed · {liveSize}</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          docker 27.4.0 · buildkit 0.18.0 · linux/amd64
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● build complete' : 'loading'}
        </span>
      </div>
    </div>
  );
}
