'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'dag' | 'task' | 'running' | 'schedule' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# apache airflow: dag orchestration — celery, sensors, xcom, dynamic tasks' },
  { kind: 'prompt',   text: 'airflow dags list --output table' },
  { kind: 'blank',    text: '' },
  { kind: 'dag',      text: '  etl_orders_daily        ✔ active  schedule: 0 2 * * *  next: 02:00' },
  { kind: 'dag',      text: '  ml_feature_pipeline     ✔ active  schedule: 0 */6 * * *  next: 6h' },
  { kind: 'dag',      text: '  analytics_rollup_hourly ✔ active  schedule: @hourly    next: 58m' },
  { kind: 'dag',      text: '  dbt_construx_prod       ✔ active  schedule: 0 3 * * *  next: 03:00' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'airflow tasks states-for-dag-run etl_orders_daily 2034-04-02T02:00:00' },
  { kind: 'blank',    text: '' },
  { kind: 'task',     text: '  extract_orders     success  00:01:42  rows: 89,412' },
  { kind: 'task',     text: '  validate_schema    success  00:00:08  checks: 14/14 passed' },
  { kind: 'running',  text: '  transform_orders   running  00:03:21  progress: 72%' },
  { kind: 'schedule', text: '  load_warehouse     queued   ---       depends: transform_orders' },
  { kind: 'metric',   text: '  active-runs: {LIVE}  tasks-queued: 3  workers: 8  failed-24h: 0' },
  { kind: 'stat',     text: '  airflow 2.9.3  celery executor  redis broker  postgres metadata' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'dag':      return '#4ade80';
    case 'task':     return '#67e8f9';
    case 'running':  return '#fbbf24';
    case 'schedule': return '#a78bfa';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function AirflowPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [activeRuns,  setActiveRuns]  = useState(4);
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
            setActiveRuns((c) => Math.max(1, c + (Math.random() > 0.6 ? 1 : -1 > 0.5 ? -1 : 0)));
          }, 5000);
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
          construx@airflow — dag · celery · sensor · xcom · dynamic tasks · schedule
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${activeRuns} running` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@airflow# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          airflow · dag · task · celery · sensor · xcom · dynamic · schedule · pool
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(activeRuns))
            : l.text;
          return (
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
                  {text}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Airflow 2.9.3 ·</span>
          <span style={{ color: '#fbbf24' }}>{activeRuns} active runs</span>
          <span style={{ color: '#4ade80' }}>4 dags</span>
          <span style={{ color: '#67e8f9' }}>8 workers</span>
          <span style={{ color: '#a78bfa' }}>0 failed</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          airflow · dag · celery · sensor · xcom · dynamic · schedule
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● running' : 'loading'}
        </span>
      </div>
    </div>
  );
}
