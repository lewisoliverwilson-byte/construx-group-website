'use client';

import { useState, useEffect, useRef } from 'react';

interface DiffLine {
  type: 'header' | 'hunk' | 'add' | 'remove' | 'context';
  content: string;
}

const DIFF: DiffLine[] = [
  { type: 'header',  content: 'diff --git a/traditional.model b/construx.model' },
  { type: 'header',  content: '--- a/traditional.model' },
  { type: 'header',  content: '+++ b/construx.model' },
  { type: 'hunk',    content: '@@ -1,18 +1,14 @@ team_structure' },
  { type: 'remove',  content: '-  headcount:        10–25 people' },
  { type: 'remove',  content: '-  time_to_hire:     3–6 months' },
  { type: 'remove',  content: '-  decision_layers:  4 (IC → Lead → Dir → VP)' },
  { type: 'remove',  content: '-  context_fidelity: low  # too many handoffs' },
  { type: 'add',     content: '+  headcount:        2 people' },
  { type: 'add',     content: '+  time_to_hire:     0' },
  { type: 'add',     content: '+  decision_layers:  1' },
  { type: 'add',     content: '+  context_fidelity: perfect  # always in the room' },
  { type: 'hunk',    content: '@@ -20,14 +16,10 @@ build_velocity' },
  { type: 'remove',  content: '-  concept_to_live:  6–18 months' },
  { type: 'remove',  content: '-  iteration_cycle:  2-week sprint' },
  { type: 'remove',  content: '-  blocker_handling: "open a ticket"' },
  { type: 'remove',  content: '-  ai_role:          "copilot feature in editor"' },
  { type: 'add',     content: '+  concept_to_live:  2–6 weeks' },
  { type: 'add',     content: '+  iteration_cycle:  same day' },
  { type: 'add',     content: '+  blocker_handling: "fix it now"' },
  { type: 'add',     content: '+  ai_role:          "primary collaborator"' },
  { type: 'hunk',    content: '@@ -35,10 +27,8 @@ capital_structure' },
  { type: 'remove',  content: '-  funding_model:    VC raise → dilution → exit pressure' },
  { type: 'remove',  content: '-  ownership:        founders + cap table' },
  { type: 'remove',  content: '-  exit_required:    yes  # or the model fails' },
  { type: 'add',     content: '+  funding_model:    revenue-first, self-funded' },
  { type: 'add',     content: '+  ownership:        founders (100%)' },
  { type: 'add',     content: '+  exit_required:    no   # optionality preserved' },
  { type: 'hunk',    content: '@@ -46,8 +36,6 @@ portfolio' },
  { type: 'remove',  content: '-  ventures:         1  # all-in, single bet' },
  { type: 'remove',  content: '-  risk_profile:     catastrophic  # binary outcome' },
  { type: 'add',     content: '+  ventures:         multiple, independent' },
  { type: 'add',     content: '+  risk_profile:     distributed  # no single point of failure' },
  { type: 'context', content: '   model:             portfolio  # permanent structure' },
];

const LINE_STYLE: Record<DiffLine['type'], { bg: string; color: string; prefix: string }> = {
  header:  { bg: 'transparent',                     color: 'rgba(240,239,255,0.35)', prefix: '' },
  hunk:    { bg: 'rgba(59,130,246,0.06)',           color: 'rgba(125,211,252,0.65)', prefix: '' },
  add:     { bg: 'rgba(74,222,128,0.06)',           color: 'rgba(74,222,128,0.85)',  prefix: '' },
  remove:  { bg: 'rgba(248,113,113,0.06)',          color: 'rgba(248,113,113,0.8)',  prefix: '' },
  context: { bg: 'transparent',                     color: 'rgba(240,239,255,0.35)', prefix: '' },
};

const STAT_ADDS    = DIFF.filter((l) => l.type === 'add').length;
const STAT_REMOVES = DIFF.filter((l) => l.type === 'remove').length;

export default function MethodologyDiffPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started.current && revealed === 0) return;
    if (revealed >= DIFF.length) return;
    const delay = DIFF[revealed].type === 'hunk' ? 120 : 55;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const handleVisible = () => {
    if (!started.current) {
      started.current = true;
      setRevealed((r) => r + 1);
    }
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleVisible}
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
          construx@sys — methodology diff
        </span>
        <span className="flex items-center gap-2 text-[8px]">
          <span style={{ color: 'rgba(74,222,128,0.7)' }}>+{STAT_ADDS}</span>
          <span style={{ color: 'rgba(248,113,113,0.7)' }}>-{STAT_REMOVES}</span>
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git diff traditional.model construx.model
        </span>
      </div>

      {/* Diff lines */}
      <div className="py-2">
        {DIFF.map((line, i) => {
          const s = LINE_STYLE[line.type];
          const visible = i < revealed;
          return (
            <div
              key={i}
              className="px-4 text-[8px] leading-[1.7]"
              style={{
                background: s.bg,
                color: s.color,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.12s ease',
                fontFamily: 'inherit',
                whiteSpace: 'pre',
              }}
            >
              {line.content}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.18)' }}>
          traditional.model → construx.model
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.45)' }}>
          {DIFF.length} lines changed
        </span>
      </div>
    </div>
  );
}
