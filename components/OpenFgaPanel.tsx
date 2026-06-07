'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'allowed' | 'denied' | 'tuple' | 'model' | 'expand' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# openfga: Zanzibar-model fine-grained authorization' },
  { kind: 'prompt',  text: 'fga model write --file=construx.fga --store-id=$STORE_ID' },
  { kind: 'model',   text: '  type workspace  { owner, admin, member }' },
  { kind: 'model',   text: '  type project    { owner, editor, viewer, can_create_issue }' },
  { kind: 'model',   text: '  type issue      { can_view, can_edit, can_delete, assignee }' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# write relationship tuples — alice owns workspace' },
  { kind: 'prompt',  text: 'fga tuple write user:alice owner workspace:construx-prod' },
  { kind: 'tuple',   text: '  user:alice   owner    workspace:construx-prod  ✓' },
  { kind: 'tuple',   text: '  user:bob     member   workspace:construx-prod  ✓' },
  { kind: 'tuple',   text: '  user:carol   editor   project:api              ✓' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# authorization checks — relationship graph traversal' },
  { kind: 'prompt',  text: 'fga query check user:bob can_view issue:ISSUE-42' },
  { kind: 'allowed', text: '  allowed: true  (bob → member → viewer → can_view)' },
  { kind: 'prompt',  text: 'fga query check user:bob can_delete issue:ISSUE-42' },
  { kind: 'denied',  text: '  allowed: false (member lacks delete permission)' },
  { kind: 'prompt',  text: 'fga query check user:carol can_edit issue:ISSUE-42' },
  { kind: 'allowed', text: '  allowed: true  (carol → editor of project:api)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# expand: explain the authorization path' },
  { kind: 'prompt',  text: 'fga query expand viewer issue:ISSUE-42' },
  { kind: 'expand',  text: '  union{ user:alice user:carol [editor from project] }' },
  { kind: 'stat',    text: '  1000 checks/s  p99 4ms  — model: construx-prod' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'allowed': return '#4ade80';
    case 'denied':  return '#f87171';
    case 'tuple':   return '#67e8f9';
    case 'model':   return '#a78bfa';
    case 'expand':  return '#fbbf24';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function OpenFgaPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveChecks,  setLiveChecks]  = useState(1000);
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
            setLiveChecks(900 + Math.floor(Math.random() * 200));
          }, 2000);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 81;
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
          construx@prod-eu — openfga · zanzibar · authz · relationship graph
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveChecks}/s checks` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          openfga · tuples · check · expand · list-objects · zanzibar
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>OpenFGA v1.6 ·</span>
          <span style={{ color: '#4ade80' }}>{liveChecks} checks/s</span>
          <span style={{ color: '#67e8f9' }}>tuple store</span>
          <span style={{ color: '#a78bfa' }}>Zanzibar model</span>
          <span style={{ color: '#fbbf24' }}>graph expand</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          openfga · zanzibar · check · expand · list · tuples · rebac
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● authorized' : 'loading'}
        </span>
      </div>
    </div>
  );
}
