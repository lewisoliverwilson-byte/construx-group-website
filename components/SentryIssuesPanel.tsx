'use client';

import { useState, useEffect, useRef } from 'react';

interface SentryIssue {
  id:          string;
  title:       string;
  culprit:     string;
  level:       'error' | 'warning' | 'fatal';
  count:       number;
  users:       number;
  firstSeen:   string;
  lastSeen:    string;
  status:      'unresolved' | 'resolved' | 'ignored';
}

const ISSUES: SentryIssue[] = [
  { id: 'CX-1841', title: 'TypeError: Cannot read properties of undefined (reading \'id\')',
    culprit: 'api/orders/route.ts in POST', level: 'error', count: 138, users: 41,
    firstSeen: '2031-11-28', lastSeen: '2 min ago', status: 'unresolved' },
  { id: 'CX-1836', title: 'PaymentDeclinedError: insufficient_funds',
    culprit: 'lib/payments.ts in chargePayment', level: 'warning', count: 29, users: 29,
    firstSeen: '2031-12-01', lastSeen: '18 min ago', status: 'unresolved' },
  { id: 'CX-1820', title: 'PgError: connection pool exhausted',
    culprit: 'lib/db.ts in query', level: 'error', count: 12, users: 0,
    firstSeen: '2031-11-15', lastSeen: '4h ago', status: 'unresolved' },
  { id: 'CX-1810', title: 'ChunkLoadError: Loading chunk 847 failed',
    culprit: 'app/(dashboard)/layout.tsx', level: 'error', count: 441, users: 312,
    firstSeen: '2031-11-10', lastSeen: '6h ago', status: 'ignored' },
  { id: 'CX-1798', title: 'ZodError: Invalid uuid at customerId',
    culprit: 'app/api/orders/route.ts in POST', level: 'warning', count: 7, users: 7,
    firstSeen: '2031-11-02', lastSeen: '2d ago', status: 'resolved' },
];

const TOTAL = ISSUES.length + 3;

function levelColor(l: SentryIssue['level']): string {
  if (l === 'fatal')   return '#f87171';
  if (l === 'error')   return '#fb923c';
  return '#fbbf24';
}

function statusColor(s: SentryIssue['status']): string {
  if (s === 'resolved') return '#4ade80';
  if (s === 'ignored')  return 'rgba(240,239,255,0.25)';
  return 'rgba(240,239,255,0.5)';
}

function statusLabel(s: SentryIssue['status']): string {
  if (s === 'resolved') return 'resolved';
  if (s === 'ignored')  return 'ignored';
  return 'unresolved';
}

export default function SentryIssuesPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [totalEvts,  setTotalEvts]  = useState(627);
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
            setTotalEvts((t) => t + Math.floor(1 + Math.random() * 4));
          }, 2200);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone     = revealed > TOTAL;
  const issueStart  = 2;
  const shownIssues = ISSUES.slice(0, Math.max(0, revealed - issueStart));

  const unresolvedCount = ISSUES.filter((i) => i.status === 'unresolved').length;

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
          construx — sentry error tracking
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: unresolvedCount > 2 ? '#fbbf24' : '#4ade80' }}>
          {allDone ? `LIVE ${totalEvts} events · ${unresolvedCount} unresolved` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sentry$ </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sentry-cli issues list --org construx-group --project construx-api --status unresolved
        </span>
      </div>

      {/* Issues */}
      {shownIssues.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '60px',  flexShrink: 0 }}>ID</span>
            <span style={{ minWidth: '44px',  flexShrink: 0 }}>Level</span>
            <span style={{ flexGrow: 1 }}>Title / culprit</span>
            <span style={{ minWidth: '44px',  flexShrink: 0, textAlign: 'right' }}>Events</span>
            <span style={{ minWidth: '40px',  flexShrink: 0, textAlign: 'right' }}>Users</span>
            <span style={{ minWidth: '72px',  flexShrink: 0, textAlign: 'right' }}>Last seen</span>
          </div>
          {shownIssues.map((issue) => (
            <div
              key={issue.id}
              className="py-0.5"
              style={{
                borderLeft: `2px solid ${issue.status === 'unresolved' ? levelColor(issue.level) + '55' : 'rgba(255,255,255,0.06)'}`,
                paddingLeft: '4px',
                marginBottom: '2px',
              }}
            >
              <div className="flex items-center text-[7.5px]">
                <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '60px', flexShrink: 0 }}>{issue.id}</span>
                <span style={{ color: levelColor(issue.level), minWidth: '44px', flexShrink: 0, fontSize: '6.5px' }}>{issue.level}</span>
                <span style={{ color: statusColor(issue.status), flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                  {issue.title}
                </span>
                <span style={{ color: issue.count > 100 ? '#fbbf24' : 'rgba(240,239,255,0.35)', minWidth: '44px', flexShrink: 0, textAlign: 'right' }}>{issue.count}</span>
                <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '40px', flexShrink: 0, textAlign: 'right' }}>{issue.users}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '72px', flexShrink: 0, textAlign: 'right' }}>{issue.lastSeen}</span>
              </div>
              <div className="text-[6.5px]" style={{ color: 'rgba(240,239,255,0.18)', paddingLeft: '104px' }}>
                {issue.culprit} · {statusLabel(issue.status)}
              </div>
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
          <span style={{ color: '#fbbf24' }}>3 unresolved issues</span>
          <span style={{ color: '#4ade80' }}>1 resolved</span>
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>1 ignored</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          sentry 24.11 · project: construx-api · production
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● 3 issues need attention' : 'loading'}
        </span>
      </div>
    </div>
  );
}
