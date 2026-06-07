'use client';

import { useState, useEffect, useRef } from 'react';

interface WorkerThread {
  id:           number;
  spawned:      number;
  stolen:       number;
  parks:        number;
  busyPct:      number;
  status:       'busy' | 'parked' | 'stealing';
}

interface TaskStat {
  name:       string;
  count:      number;
  pollUs:     number;
  wakeUs:     number;
}

const WORKERS: WorkerThread[] = [
  { id: 0, spawned: 18241, stolen: 312, parks: 44, busyPct: 82, status: 'busy' },
  { id: 1, spawned: 17903, stolen: 289, parks: 51, busyPct: 78, status: 'busy' },
  { id: 2, spawned: 14422, stolen: 201, parks: 88, busyPct: 61, status: 'stealing' },
  { id: 3, spawned: 12089, stolen: 177, parks: 112, busyPct: 49, status: 'parked' },
  { id: 4, spawned: 11834, stolen: 155, parks: 119, busyPct: 47, status: 'parked' },
  { id: 5, spawned: 9201,  stolen: 98,  parks: 144, busyPct: 37, status: 'parked' },
  { id: 6, spawned: 8472,  stolen: 84,  parks: 156, busyPct: 34, status: 'parked' },
  { id: 7, spawned: 7311,  stolen: 71,  parks: 188, busyPct: 29, status: 'parked' },
];

const TASKS: TaskStat[] = [
  { name: 'handle_request',    count: 18241, pollUs: 42,  wakeUs: 8  },
  { name: 'db_query',          count: 14203, pollUs: 180, wakeUs: 22 },
  { name: 'redis_get',         count: 8841,  pollUs: 28,  wakeUs: 5  },
  { name: 'send_email',        count: 441,   pollUs: 220, wakeUs: 14 },
  { name: 'background_worker', count: 120,   pollUs: 380, wakeUs: 41 },
];

const TOTAL = WORKERS.length + TASKS.length + 5;

function statusColor(s: WorkerThread['status']): string {
  if (s === 'busy')     return '#4ade80';
  if (s === 'stealing') return '#fbbf24';
  return 'rgba(240,239,255,0.25)';
}

function busyBar(pct: number): string {
  const filled = Math.round(pct / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

function pollColor(us: number): string {
  if (us < 50)  return '#4ade80';
  if (us < 200) return '#fbbf24';
  return '#f87171';
}

export default function TokioRuntimePanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [totalTasks, setTotalTasks] = useState(18241);
  const [stolen,     setStolen]     = useState(1387);
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
            setTotalTasks((t) => t + Math.floor(80 + Math.random() * 40));
            setStolen((s) => s + Math.floor(2 + Math.random() * 5));
          }, 1950);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 84);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone      = revealed > TOTAL;
  const workerStart  = 2;
  const taskStart    = WORKERS.length + 3;
  const shownWorkers = WORKERS.slice(0, Math.max(0, revealed - workerStart));
  const shownTasks   = TASKS.slice(0,   Math.max(0, revealed - taskStart));

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
          construx@api — tokio runtime metrics
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: '#4ade80' }}>
          {allDone ? `LIVE ${totalTasks.toLocaleString()} tasks · ${stolen.toLocaleString()} stolen` : 'sampling…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@api$ </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          tokio-console --retain-for 60s
        </span>
      </div>

      {/* Worker threads */}
      {shownWorkers.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Worker threads — 8 threads · work-stealing
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '28px', flexShrink: 0 }}>ID</span>
            <span style={{ minWidth: '80px', flexShrink: 0 }}>Busy %</span>
            <span style={{ minWidth: '64px', flexShrink: 0 }}>Spawned</span>
            <span style={{ minWidth: '56px', flexShrink: 0 }}>Stolen</span>
            <span style={{ minWidth: '52px', flexShrink: 0 }}>Parks</span>
            <span>State</span>
          </div>
          {shownWorkers.map((w) => (
            <div key={w.id} className="flex items-center text-[7.5px] leading-[1.85]">
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '28px', flexShrink: 0 }}>{w.id}</span>
              <span style={{ color: statusColor(w.status), minWidth: '80px', flexShrink: 0, fontFamily: 'monospace', fontSize: '6.5px', letterSpacing: '-0.02em' }}>
                {busyBar(w.busyPct)} {w.busyPct}%
              </span>
              <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '64px', flexShrink: 0 }}>{w.spawned.toLocaleString()}</span>
              <span style={{ color: '#fbbf24', minWidth: '56px', flexShrink: 0 }}>{w.stolen}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '52px', flexShrink: 0 }}>{w.parks}</span>
              <span style={{ color: statusColor(w.status), fontSize: '7px' }}>{w.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Task stats */}
      {shownTasks.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Task poll times — median µs
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '180px', flexShrink: 0 }}>Task name</span>
            <span style={{ minWidth: '72px', flexShrink: 0 }}>Count</span>
            <span style={{ minWidth: '72px', flexShrink: 0 }}>Poll µs</span>
            <span>Wake µs</span>
          </div>
          {shownTasks.map((t) => (
            <div key={t.name} className="flex items-center text-[7.5px] leading-[1.85]">
              <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '180px', flexShrink: 0 }}>{t.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '72px', flexShrink: 0 }}>{t.count.toLocaleString()}</span>
              <span style={{ color: pollColor(t.pollUs), minWidth: '72px', flexShrink: 0 }}>{t.pollUs}µs</span>
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>{t.wakeUs}µs</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>8 worker threads</span>
          <span style={{ color: '#4ade80' }}>handle_request 42µs median poll</span>
          <span style={{ color: '#fbbf24' }}>background_worker 380µs (watch)</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          tokio 1.41 · work-stealing · 8 threads · axum 0.8
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● runtime healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
