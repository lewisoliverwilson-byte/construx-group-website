'use client';

import { useState, useEffect, useRef } from 'react';

interface WorkflowEvent {
  seq:       number;
  type:      string;
  activity?: string;
  attempt?:  number;
  result?:   'ok' | 'retry' | 'failed';
  elapsed:   string;
}

const EVENTS: WorkflowEvent[] = [
  { seq: 1,  type: 'WorkflowExecutionStarted',  elapsed: '0ms' },
  { seq: 2,  type: 'WorkflowTaskScheduled',      elapsed: '1ms' },
  { seq: 3,  type: 'WorkflowTaskStarted',        elapsed: '3ms' },
  { seq: 4,  type: 'WorkflowTaskCompleted',      elapsed: '11ms' },
  { seq: 5,  type: 'ActivityTaskScheduled',      activity: 'reserveInventory',     attempt: 1, elapsed: '12ms' },
  { seq: 6,  type: 'ActivityTaskStarted',        activity: 'reserveInventory',     attempt: 1, elapsed: '14ms' },
  { seq: 7,  type: 'ActivityTaskCompleted',      activity: 'reserveInventory',     attempt: 1, result: 'ok',    elapsed: '88ms' },
  { seq: 8,  type: 'ActivityTaskScheduled',      activity: 'chargePayment',        attempt: 1, elapsed: '89ms' },
  { seq: 9,  type: 'ActivityTaskStarted',        activity: 'chargePayment',        attempt: 1, elapsed: '91ms' },
  { seq: 10, type: 'ActivityTaskFailed',         activity: 'chargePayment',        attempt: 1, result: 'retry', elapsed: '1.2s' },
  { seq: 11, type: 'ActivityTaskScheduled',      activity: 'chargePayment',        attempt: 2, elapsed: '2.2s' },
  { seq: 12, type: 'ActivityTaskStarted',        activity: 'chargePayment',        attempt: 2, elapsed: '2.2s' },
  { seq: 13, type: 'ActivityTaskCompleted',      activity: 'chargePayment',        attempt: 2, result: 'ok',    elapsed: '2.8s' },
  { seq: 14, type: 'ActivityTaskScheduled',      activity: 'sendConfirmationEmail', attempt: 1, elapsed: '2.8s' },
  { seq: 15, type: 'ActivityTaskStarted',        activity: 'sendConfirmationEmail', attempt: 1, elapsed: '2.8s' },
  { seq: 16, type: 'ActivityTaskCompleted',      activity: 'sendConfirmationEmail', attempt: 1, result: 'ok',   elapsed: '3.2s' },
  { seq: 17, type: 'ActivityTaskScheduled',      activity: 'shipOrder',            attempt: 1, elapsed: '3.2s' },
  { seq: 18, type: 'ActivityTaskStarted',        activity: 'shipOrder',            attempt: 1, elapsed: '3.3s' },
  { seq: 19, type: 'ActivityTaskCompleted',      activity: 'shipOrder',            attempt: 1, result: 'ok',    elapsed: '4.1s' },
  { seq: 20, type: 'WorkflowTaskScheduled',      elapsed: '4.1s' },
  { seq: 21, type: 'WorkflowTaskStarted',        elapsed: '4.1s' },
  { seq: 22, type: 'WorkflowExecutionCompleted', elapsed: '4.2s' },
];

const TOTAL = EVENTS.length + 4;

function typeColor(type: string): string {
  if (type.includes('Completed'))   return '#4ade80';
  if (type.includes('Started'))     return 'rgba(96,165,250,0.85)';
  if (type.includes('Scheduled'))   return 'rgba(240,239,255,0.45)';
  if (type.includes('Failed'))      return '#f87171';
  if (type.includes('ExecutionStarted'))  return '#a78bfa';
  if (type.includes('ExecutionCompleted')) return '#4ade80';
  return 'rgba(240,239,255,0.35)';
}

function resultBadge(r?: WorkflowEvent['result']): { label: string; color: string } | null {
  if (!r) return null;
  if (r === 'ok')    return { label: 'OK',    color: '#4ade80' };
  if (r === 'retry') return { label: 'RETRY', color: '#fbbf24' };
  return                    { label: 'FAIL',  color: '#f87171' };
}

export default function TemporalWorkflowPanel() {
  const [revealed, setRevealed] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const startTs  = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          startTs.current = Date.now();
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setElapsedMs(Date.now() - startTs.current);
          }, 80);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 82);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed > TOTAL && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsedMs(4247);
    }
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone     = revealed > TOTAL;
  const eventsStart = 3;
  const shownEvents = EVENTS.slice(0, Math.max(0, revealed - eventsStart));

  const fmtMs = (ms: number) =>
    ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;

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
          construx@temporal — workflow execution history
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : '#fbbf24' }}>
          {allDone ? `COMPLETED ${fmtMs(4247)}` : `RUNNING ${fmtMs(elapsedMs)}`}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@temporal$ </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          temporal workflow show --workflow-id order-a3f9b2c1 --namespace production
        </span>
      </div>

      {/* Workflow meta */}
      {revealed > 1 && (
        <div className="px-4 pt-2 pb-1">
          <div className="flex flex-wrap gap-x-6 gap-y-0.5 text-[7px]" style={{ color: 'rgba(240,239,255,0.3)' }}>
            <span>Workflow: <span style={{ color: 'rgba(167,139,250,0.8)' }}>orderFulfillment</span></span>
            <span>ID: <span style={{ color: 'rgba(240,239,255,0.5)' }}>order-a3f9b2c1</span></span>
            <span>Namespace: <span style={{ color: 'rgba(240,239,255,0.5)' }}>production</span></span>
            <span>TaskQueue: <span style={{ color: 'rgba(240,239,255,0.5)' }}>order-fulfillment</span></span>
          </div>
        </div>
      )}

      {/* Events */}
      {shownEvents.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          {/* Column headers */}
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '28px', flexShrink: 0 }}>#</span>
            <span style={{ minWidth: '220px', flexShrink: 0 }}>Event type</span>
            <span style={{ minWidth: '160px', flexShrink: 0 }}>Activity</span>
            <span style={{ minWidth: '36px', flexShrink: 0 }}>Att</span>
            <span style={{ minWidth: '44px', flexShrink: 0 }}>Result</span>
            <span>Elapsed</span>
          </div>
          {shownEvents.map((ev) => {
            const badge = resultBadge(ev.result);
            return (
              <div key={ev.seq} className="flex items-center text-[7.5px] leading-[1.9]">
                <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '28px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{ev.seq}</span>
                <span style={{ color: typeColor(ev.type), minWidth: '220px', flexShrink: 0 }}>{ev.type}</span>
                <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '160px', flexShrink: 0 }}>{ev.activity ?? '—'}</span>
                <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '36px', flexShrink: 0 }}>{ev.attempt ?? '—'}</span>
                <span style={{ minWidth: '44px', flexShrink: 0 }}>
                  {badge ? (
                    <span style={{ color: badge.color, fontSize: '6.5px', fontWeight: 700 }}>{badge.label}</span>
                  ) : (
                    <span style={{ color: 'rgba(240,239,255,0.15)' }}>—</span>
                  )}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>{ev.elapsed}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>22 events</span>
          <span style={{ color: '#fbbf24' }}>1 activity retry (chargePayment)</span>
          <span style={{ color: '#4ade80' }}>completed in 4.2s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          temporal 1.25.2 · namespace production · task-queue order-fulfillment
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : '#fbbf24' }}>
          {allDone ? '● completed' : '● running'}
        </span>
      </div>
    </div>
  );
}
