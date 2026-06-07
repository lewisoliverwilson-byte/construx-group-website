'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind =
  | 'prompt'
  | 'bisect-start'
  | 'bisect-info'
  | 'checkout-hash'
  | 'test-run'
  | 'test-pass'
  | 'test-fail'
  | 'mark-good'
  | 'mark-bad'
  | 'found'
  | 'commit-detail'
  | 'author-line'
  | 'diff-line'
  | 'blank';

interface BisectLine {
  kind: LineKind;
  text: string;
}

const LINES: BisectLine[] = [
  { kind: 'prompt',       text: 'git bisect start' },
  { kind: 'prompt',       text: 'git bisect bad HEAD                   # current commit is broken' },
  { kind: 'prompt',       text: 'git bisect good v2.4.0               # last known good tag' },
  { kind: 'bisect-info',  text: 'Bisecting: 23 revisions left to test after this (roughly 5 steps)' },
  { kind: 'checkout-hash',text: '[4e9c8b2] feat: add order validation middleware' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'bun test orders.test.ts --reporter=min' },
  { kind: 'test-run',     text: 'bun test v1.1.38 (macOS Sequoia)' },
  { kind: 'test-pass',    text: '✓ orders › createOrder inserts and returns the order [18ms]' },
  { kind: 'test-pass',    text: '✓ orders › getOrder returns correct order [12ms]' },
  { kind: 'test-fail',    text: '✗ orders › checkRateLimit blocks after limit [3ms]' },
  { kind: 'bisect-info',  text: '1 fail' },
  { kind: 'prompt',       text: 'git bisect bad' },
  { kind: 'bisect-info',  text: 'Bisecting: 11 revisions left to test after this (roughly 4 steps)' },
  { kind: 'checkout-hash',text: '[7f2d5a1] refactor: extract rate limit logic to middleware' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'bun test orders.test.ts --reporter=min' },
  { kind: 'test-pass',    text: '✓ orders › createOrder inserts and returns the order [19ms]' },
  { kind: 'test-pass',    text: '✓ orders › getOrder returns correct order [11ms]' },
  { kind: 'test-pass',    text: '✓ orders › checkRateLimit blocks after limit [2ms]' },
  { kind: 'bisect-info',  text: '3 pass' },
  { kind: 'prompt',       text: 'git bisect good' },
  { kind: 'bisect-info',  text: 'Bisecting: 5 revisions left to test after this (roughly 3 steps)' },
  { kind: 'checkout-hash',text: '[c1e6f9b] fix: correct window calculation in sliding rate limit' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'bun test orders.test.ts --reporter=min' },
  { kind: 'test-pass',    text: '✓ orders › createOrder inserts and returns the order [17ms]' },
  { kind: 'test-pass',    text: '✓ orders › getOrder returns correct order [13ms]' },
  { kind: 'test-fail',    text: '✗ orders › checkRateLimit blocks after limit [4ms]' },
  { kind: 'bisect-info',  text: '1 fail' },
  { kind: 'prompt',       text: 'git bisect bad' },
  { kind: 'bisect-info',  text: 'Bisecting: 2 revisions left to test after this (roughly 1 step)' },
  { kind: 'checkout-hash',text: '[2a8d4c7] feat: pipeline redis commands for rate limit check' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'bun test orders.test.ts --reporter=min' },
  { kind: 'test-pass',    text: '✓ orders › createOrder inserts and returns the order [18ms]' },
  { kind: 'test-pass',    text: '✓ orders › getOrder returns correct order [12ms]' },
  { kind: 'test-fail',    text: '✗ orders › checkRateLimit blocks after limit [3ms]' },
  { kind: 'bisect-info',  text: '1 fail' },
  { kind: 'prompt',       text: 'git bisect bad' },
  { kind: 'blank',        text: '' },
  { kind: 'found',        text: 'c1e6f9b3d8a4e7f2c5b9d1e4a7f0c3b6d9 is the first bad commit' },
  { kind: 'commit-detail',text: 'commit c1e6f9b3d8a4e7f2c5b9d1e4a7f0c3b6d9' },
  { kind: 'author-line',  text: 'Author: Lewis Wilson <lewis@construxgroup.io>' },
  { kind: 'author-line',  text: 'Date:   Mon Sep 15 16:42:07 2031 +0000' },
  { kind: 'blank',        text: '' },
  { kind: 'commit-detail',text: '    fix: correct window calculation in sliding rate limit' },
  { kind: 'blank',        text: '' },
  { kind: 'diff-line',    text: '-  pipe.zremrangebyscore(key, \'-inf\', now - windowMs);' },
  { kind: 'diff-line',    text: '+  pipe.zremrangebyscore(key, \'-inf\', now - windowMs - 1);' },
];

const TOTAL = LINES.length;

function lineColor(kind: LineKind): string {
  switch (kind) {
    case 'prompt':       return 'rgba(240,239,255,0.55)';
    case 'bisect-start': return '#4ade80';
    case 'bisect-info':  return 'rgba(167,139,250,0.7)';
    case 'checkout-hash':return 'rgba(251,191,36,0.7)';
    case 'test-run':     return 'rgba(240,239,255,0.28)';
    case 'test-pass':    return '#4ade80';
    case 'test-fail':    return '#f87171';
    case 'mark-good':    return '#4ade80';
    case 'mark-bad':     return '#f87171';
    case 'found':        return '#fbbf24';
    case 'commit-detail':return 'rgba(251,191,36,0.6)';
    case 'author-line':  return 'rgba(240,239,255,0.38)';
    case 'diff-line':    return (kind === 'diff-line') ? 'rgba(240,239,255,0.4)' : 'rgba(240,239,255,0.4)';
    default:             return 'rgba(240,239,255,0.3)';
  }
}

export default function GitBisectPanel() {
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
    const line  = LINES[revealed - 1];
    const delay = line.kind === 'blank' ? 30 : 77;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.min(LINES.length, revealed));
  const stepsTotal = 5;
  const stepsDone  = Math.min(stepsTotal, Math.floor((revealed / TOTAL) * stepsTotal));

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
          construx@dev-macbook — git bisect
        </span>
        <span className="text-[8px]" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '● found' : `step ${stepsDone}/${stepsTotal}…`}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~/construx-api$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git bisect start
        </span>
      </div>

      {/* Lines */}
      <div className="px-4 py-2 space-y-px">
        {shownLines.map((line, i) => {
          if (line.kind === 'blank') return <div key={i} className="h-1.5" />;
          const isPrompt = line.kind === 'prompt';
          const isDiff   = line.kind === 'diff-line';
          const isRem    = isDiff && line.text.startsWith('-');
          const isAdd    = isDiff && line.text.startsWith('+');
          const color    = isRem ? '#f87171' : isAdd ? '#4ade80' : lineColor(line.kind);
          return (
            <div key={i} className="flex items-start gap-2 text-[7.5px] leading-[1.8]">
              <span className="shrink-0 text-[7.5px]" style={{ color: isPrompt ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)', marginTop: '1px' }}>
                {isPrompt ? '$' : '›'}
              </span>
              <span style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line.text}</span>
            </div>
          );
        })}
        {!allDone && revealed > 0 && (
          <div className="flex items-center gap-1 text-[7.5px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
            <span style={{ animation: 'pulse 1s infinite' }}>▋</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#fbbf24' }}>first bad: c1e6f9b</span>
          <span>5 steps · 23 commits bisected</span>
          <span>root cause: off-by-one in zremrangebyscore</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          git 2.47.0 · binary search · 5 steps for 23 commits
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● bisect complete' : 'bisecting'}
        </span>
      </div>
    </div>
  );
}
