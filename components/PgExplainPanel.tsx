'use client';

import { useState, useEffect, useRef } from 'react';

interface PlanNode {
  depth:     number;
  connector: string;
  nodeType:  string;
  detail:    string;
  cost:      string;
  actual:    string;
  rows:      string;
  loops:     string;
  isSlowNode?: boolean;
}

const NODES: PlanNode[] = [
  { depth: 0, connector: '',      nodeType: 'HashAggregate',    detail: '(cost=3812.44..3887.44 rows=7500 width=96)',   cost: '3812.44', actual: '188.412..201.883', rows: '7491',  loops: '1',  isSlowNode: false },
  { depth: 1, connector: '->',   nodeType: 'Hash Join',         detail: 'Hash Cond: (w.owner_id = u.id)',               cost: '3112.44', actual: '141.230..178.401', rows: '74910', loops: '1',  isSlowNode: false },
  { depth: 2, connector: '->',   nodeType: 'Seq Scan',          detail: 'on workspaces w  (rows=74910 width=72)',       cost: '0.00..1624.10',   actual: '0.102..58.240',  rows: '74910', loops: '1',  isSlowNode: true  },
  { depth: 3, connector: '',     nodeType: 'Filter',            detail: "(plan = 'pro') AND (is_active = true)",        cost: '',        actual: '',                rows: '—',    loops: '—',  isSlowNode: false },
  { depth: 3, connector: '',     nodeType: 'Rows Removed',      detail: 'by Filter: 125090',                           cost: '',        actual: '',                rows: '—',    loops: '—',  isSlowNode: false },
  { depth: 2, connector: '->',   nodeType: 'Hash',             detail: '(Batches=1 Memory Usage=3072kB)',               cost: '481.00..481.00',  actual: '21.408..21.408', rows: '20000', loops: '1',  isSlowNode: false },
  { depth: 3, connector: '->',   nodeType: 'Index Scan',        detail: 'on users u  using users_pkey',                cost: '0.43..481.00',    actual: '0.059..16.421',  rows: '20000', loops: '1',  isSlowNode: false },
  { depth: 2, connector: '->',   nodeType: 'Sort',             detail: 'Sort Key: w.created_at DESC',                  cost: '982.00..1169.28', actual: '2.891..14.203',  rows: '74910', loops: '1',  isSlowNode: false },
  { depth: 3, connector: '',     nodeType: 'Sort Method',       detail: 'external merge  Disk: 9472kB',                cost: '',        actual: '',                rows: '—',    loops: '—',  isSlowNode: true  },
];

const BUFFERS = [
  { label: 'shared hit',   value: '4812', color: '#4ade80' },
  { label: 'shared read',  value: '2091', color: '#fbbf24' },
  { label: 'temp written', value: '1184', color: '#f87171' },
  { label: 'temp read',    value: '1184', color: '#fb923c' },
];

const TIMING = [
  { label: 'Planning Time',   value: '2.381 ms' },
  { label: 'Execution Time',  value: '204.912 ms' },
];

const TOTAL = NODES.length + BUFFERS.length + TIMING.length;

function nodeColor(n: PlanNode): string {
  if (n.isSlowNode)         return '#fbbf24';
  if (n.nodeType === 'Filter' || n.nodeType === 'Rows Removed' || n.nodeType === 'Sort Method')
    return 'rgba(240,239,255,0.22)';
  if (n.nodeType.includes('Seq Scan')) return '#f87171';
  if (n.nodeType.includes('Index'))    return '#4ade80';
  if (n.nodeType.includes('Hash'))     return '#60a5fa';
  if (n.nodeType.includes('Sort'))     return '#a78bfa';
  return 'rgba(240,239,255,0.55)';
}

const INDENT = 12;

export default function PgExplainPanel() {
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone      = revealed > TOTAL;
  const shownNodes   = NODES.slice(0, Math.max(0, Math.min(NODES.length, revealed)));
  const shownBuffers = BUFFERS.slice(0, Math.max(0, Math.min(BUFFERS.length, revealed - NODES.length)));
  const shownTiming  = TIMING.slice(0, Math.max(0, Math.min(TIMING.length, revealed - NODES.length - BUFFERS.length)));

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
          construx@sys — psql construx_prod
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '204ms' : 'planning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          psql construx_prod -c &quot;EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT w.*, u.email FROM workspaces w ...&quot;
        </span>
      </div>

      {/* Column header */}
      {shownNodes.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ flex: 1 }}>Query Plan Node</span>
          <span style={{ minWidth: '104px', flexShrink: 0, textAlign: 'right' }}>Cost Range</span>
          <span style={{ minWidth: '118px', flexShrink: 0, textAlign: 'right' }}>Actual Time (ms)</span>
          <span style={{ minWidth: '48px',  flexShrink: 0, textAlign: 'right' }}>Rows</span>
        </div>
      )}

      {/* Plan nodes */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownNodes.map((n, i) => (
          <div key={i} className="flex items-start text-[7.5px] leading-[1.7]">
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '3px' }}>
              <span style={{ width: `${n.depth * INDENT}px`, flexShrink: 0 }} />
              {n.connector && (
                <span style={{ color: 'rgba(240,239,255,0.15)', flexShrink: 0, minWidth: '16px' }}>
                  {n.connector}
                </span>
              )}
              <div>
                <span style={{ color: nodeColor(n), fontWeight: n.depth === 0 ? 700 : 400 }}>
                  {n.nodeType}
                </span>
                {n.detail && (
                  <span style={{ color: 'rgba(240,239,255,0.22)', marginLeft: '4px' }}>
                    {n.detail}
                  </span>
                )}
              </div>
            </div>
            {n.cost && (
              <>
                <span style={{ minWidth: '104px', flexShrink: 0, textAlign: 'right', color: 'rgba(240,239,255,0.2)' }}>
                  {n.cost}
                </span>
                <span style={{ minWidth: '118px', flexShrink: 0, textAlign: 'right', color: n.isSlowNode ? '#fbbf24' : 'rgba(240,239,255,0.3)' }}>
                  {n.actual}
                </span>
                <span style={{ minWidth: '48px', flexShrink: 0, textAlign: 'right', color: 'rgba(240,239,255,0.25)' }}>
                  {n.rows}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Buffers */}
      {shownBuffers.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — buffers
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            {shownBuffers.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[7.5px]">
                <span style={{ color: 'rgba(240,239,255,0.25)' }}>{b.label}:</span>
                <span style={{ color: b.color, fontWeight: 700 }}>{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timing */}
      {shownTiming.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-5 flex-wrap">
            {shownTiming.map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[7.5px]">
                <span style={{ color: 'rgba(240,239,255,0.25)' }}>{t.label}:</span>
                <span style={{ color: i === 1 ? '#fbbf24' : '#4ade80', fontWeight: 700 }}>{t.value}</span>
              </div>
            ))}
            {allDone && (
              <span className="ml-auto text-[7px]" style={{ color: '#f87171' }}>
                seq scan + disk sort · add index on (plan, is_active)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          postgresql 16.3 · construx_prod · explain analyze
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● slow query detected' : 'loading'}
        </span>
      </div>
    </div>
  );
}
