'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'step' | 'running' | 'artifact' | 'dag' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# argo workflows: dag-based pipeline orchestration on kubernetes' },
  { kind: 'prompt',   text: 'argo get -n construx-prod @latest' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# workflow: ml-training-xk2j9  status: running  3/6 steps' },
  { kind: 'step',     text: '  ✔ prepare-data         completed  1m12s  dataset.parquet → s3' },
  { kind: 'step',     text: '  ✔ feature-engineering  completed  2m04s  features.parquet → s3' },
  { kind: 'running',  text: '  ⚙ train-model-a        running    2m18s  xgboost  gpu:1' },
  { kind: 'running',  text: '  ⚙ train-model-b        running    2m18s  lightgbm gpu:1' },
  { kind: 'dag',      text: '  ○ evaluate             pending    awaiting: train-a + train-b' },
  { kind: 'dag',      text: '  ○ push-model-registry  pending    awaiting: evaluate' },
  { kind: 'blank',    text: '' },
  { kind: 'artifact', text: '  artifacts: dataset.parquet 2.4GB  features.parquet 840MB  s3' },
  { kind: 'metric',   text: '  workflows-today: 4  succeeded:3  running:1  p50-duration: 14m' },
  { kind: 'stat',     text: '  6 steps  2 parallel  2 gpu pods  argo workflows 3.5.10' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'step':     return '#4ade80';
    case 'running':  return '#fbbf24';
    case 'artifact': return '#67e8f9';
    case 'dag':      return '#a78bfa';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function ArgoWorkflowsPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveDur,    setLiveDur]    = useState(378);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveDur((d) => d + 1 + Math.floor(Math.random() * 3));
          }, 2700);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 80;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, revealed - 1));
  const mins = Math.floor(liveDur / 60);
  const secs = liveDur % 60;

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
          construx@pipelines — argo · workflows · dag · artifacts · gpu-training
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${mins}m${String(secs).padStart(2,'0')}s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@pipelines# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          argo · dag · steps · artifacts · retry · cronworkflow · templates
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => (
          <div
            key={i}
            className="text-[7.5px] leading-[1.8]"
            style={{ color: lineColor(l.kind) }}
          >
            {l.kind === 'blank' ? ' ' : (
              <>
                {l.kind === 'prompt' && (
                  <span style={{ color: 'rgba(74,222,128,0.45)', marginRight: '6px' }}>$</span>
                )}
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Argo 3.5.10 ·</span>
          <span style={{ color: '#4ade80' }}>2 completed</span>
          <span style={{ color: '#fbbf24' }}>2 running</span>
          <span style={{ color: '#67e8f9' }}>3.2GB artifacts</span>
          <span style={{ color: '#a78bfa' }}>{mins}m{String(secs).padStart(2,'0')}s elapsed</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          argo · dag · artifacts · retry · cron · workflowtemplate
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● running' : 'loading'}
        </span>
      </div>
    </div>
  );
}
