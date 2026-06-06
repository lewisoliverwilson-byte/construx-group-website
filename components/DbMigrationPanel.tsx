'use client';

import { useState, useEffect, useRef } from 'react';

type MigStatus = 'applied' | 'pending' | 'squashed';

interface Migration {
  idx:       number;
  name:      string;
  appliedAt: string;
  checksum:  string;
  ms:        number;
  status:    MigStatus;
}

const MIGRATIONS: Migration[] = [
  { idx:  1, name: '0001_initial_schema',            appliedAt: '2031-01-15 08:00:11', checksum: 'f4a9b2c1', ms:  44, status: 'applied' },
  { idx:  2, name: '0002_add_workspaces',            appliedAt: '2031-01-16 09:22:38', checksum: 'a1d3e4f2', ms:  28, status: 'applied' },
  { idx:  3, name: '0003_add_sessions',              appliedAt: '2031-01-17 14:01:55', checksum: 'c7b8a9d0', ms:  19, status: 'applied' },
  { idx:  4, name: '0004_workspace_plan_column',     appliedAt: '2031-01-20 10:44:12', checksum: '2e5f6g3h', ms:  12, status: 'applied' },
  { idx:  5, name: '0005_add_stripe_customer_id',    appliedAt: '2031-01-22 15:33:29', checksum: 'h1j2k3l4', ms:   9, status: 'applied' },
  { idx:  6, name: '0006_posts_table',               appliedAt: '2031-01-28 11:08:47', checksum: 'm5n6p7q8', ms:  31, status: 'applied' },
  { idx:  7, name: '0007_workspace_invites',         appliedAt: '2031-02-03 09:55:02', checksum: 'r9s0t1u2', ms:  22, status: 'applied' },
  { idx:  8, name: '0008_audit_log',                 appliedAt: '2031-02-10 16:22:18', checksum: 'v3w4x5y6', ms:  38, status: 'applied' },
  { idx:  9, name: '0009_squash_0001_0008',          appliedAt: '2031-02-14 08:00:00', checksum: 'z7a8b9c0', ms: 114, status: 'squashed' },
  { idx: 10, name: '0010_workspace_is_active',       appliedAt: '2031-02-18 13:04:41', checksum: 'd1e2f3g4', ms:   8, status: 'applied' },
  { idx: 11, name: '0011_add_indexes',               appliedAt: '2031-03-01 09:30:05', checksum: 'h5j6k7l8', ms:  62, status: 'applied' },
  { idx: 12, name: '0012_full_text_search_vector',   appliedAt: '—',                   checksum: 'm9n0p1q2', ms:   0, status: 'pending' },
  { idx: 13, name: '0013_workspace_custom_domain',   appliedAt: '—',                   checksum: 'r3s4t5u6', ms:   0, status: 'pending' },
];

const TOTAL = MIGRATIONS.length;

function statusColor(s: MigStatus): string {
  if (s === 'applied')  return '#4ade80';
  if (s === 'pending')  return '#fbbf24';
  return '#60a5fa';
}

function statusLabel(s: MigStatus): string {
  if (s === 'applied')  return 'applied';
  if (s === 'pending')  return 'pending';
  return 'squashed';
}

export default function DbMigrationPanel() {
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
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 77);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone   = revealed > TOTAL;
  const shownMigs = MIGRATIONS.slice(0, Math.max(0, Math.min(MIGRATIONS.length, revealed)));

  const applied  = MIGRATIONS.filter((m) => m.status === 'applied').length;
  const pending  = MIGRATIONS.filter((m) => m.status === 'pending').length;

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
          construx@sys — drizzle-kit migrate status
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? (pending > 0 ? '#fbbf24' : '#4ade80') : 'rgba(240,239,255,0.2)' }}>
          {allDone ? (pending > 0 ? `${pending} pending` : 'up to date') : 'checking…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          drizzle-kit migrate --config=drizzle.config.ts --verbose
        </span>
      </div>

      {/* Column headers */}
      {shownMigs.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '28px',  flexShrink: 0 }}>#</span>
          <span style={{ minWidth: '216px', flexShrink: 0 }}>Migration</span>
          <span style={{ minWidth: '56px',  flexShrink: 0 }}>Status</span>
          <span style={{ minWidth: '152px', flexShrink: 0 }}>Applied At</span>
          <span style={{ minWidth: '64px',  flexShrink: 0 }}>Checksum</span>
          <span>Time</span>
        </div>
      )}

      {/* Migration rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownMigs.map((m, i) => (
          <div
            key={i}
            className="flex items-center text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: m.status === 'pending' ? '2px solid rgba(251,191,36,0.4)' : m.status === 'squashed' ? '2px solid rgba(96,165,250,0.3)' : '2px solid transparent',
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '28px', flexShrink: 0 }}>{String(m.idx).padStart(2, '0')}</span>
            <span style={{ color: m.status === 'pending' ? 'rgba(251,191,36,0.7)' : 'rgba(240,239,255,0.45)', minWidth: '216px', flexShrink: 0 }}>{m.name}</span>
            <span style={{ color: statusColor(m.status), minWidth: '56px', flexShrink: 0, fontWeight: 700, fontSize: '6.5px' }}>
              {statusLabel(m.status)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '152px', flexShrink: 0 }}>{m.appliedAt}</span>
            <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '64px', flexShrink: 0, fontFamily: 'monospace' }}>{m.checksum}</span>
            <span style={{ color: m.ms > 50 ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
              {m.ms > 0 ? `${m.ms}ms` : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{applied} applied</span>
          {pending > 0 && <span style={{ color: '#fbbf24' }}>{pending} pending</span>}
          <span style={{ color: '#60a5fa' }}>1 squash</span>
          <span className="ml-auto">database: construx_prod · drizzle-kit 0.30.1</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          drizzle-kit 0.30.1 · postgresql · construx_prod
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? (pending > 0 ? '#fbbf24' : '#4ade80') : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${TOTAL} migrations` : 'loading'}
        </span>
      </div>
    </div>
  );
}
