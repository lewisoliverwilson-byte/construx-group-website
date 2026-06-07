'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'worktree-main' | 'worktree-branch' | 'status-ok' | 'status-mod' | 'log' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',        text: '# git worktree — multiple branches checked out simultaneously' },
  { kind: 'prompt',         text: 'git worktree list --porcelain' },
  { kind: 'worktree-main',  text: 'worktree /code/construx-group-website' },
  { kind: 'worktree-main',  text: 'HEAD a4f8c2d3b1e9f7 [master] — main development tree' },
  { kind: 'worktree-branch', text: 'worktree /code/construx-group-website-feat-search' },
  { kind: 'worktree-branch', text: 'HEAD b7e9d1f4c3a2   [feat/meilisearch-integration] — active feature' },
  { kind: 'worktree-branch', text: 'worktree /code/construx-group-website-hotfix' },
  { kind: 'worktree-branch', text: 'HEAD c3a2e8b9d1f4   [hotfix/ssl-cert-renewal] — urgent fix' },
  { kind: 'blank',          text: '' },
  { kind: 'comment',        text: '# Add a worktree for a new feature branch' },
  { kind: 'prompt',         text: 'git worktree add ../construx-website-feat-karpenter -b feat/karpenter-docs' },
  { kind: 'status-ok',      text: 'Preparing worktree (new branch \'feat/karpenter-docs\')' },
  { kind: 'status-ok',      text: 'HEAD is now at a4f8c2d feat: MeilisearchPanel on journal page; dispatches 902-904' },
  { kind: 'blank',          text: '' },
  { kind: 'comment',        text: '# Switch between trees: each has its own working directory' },
  { kind: 'prompt',         text: 'cd ../construx-website-feat-karpenter && git status' },
  { kind: 'status-ok',      text: 'On branch feat/karpenter-docs' },
  { kind: 'status-ok',      text: 'nothing to commit, working tree clean' },
  { kind: 'blank',          text: '' },
  { kind: 'comment',        text: '# Check git log across worktrees simultaneously' },
  { kind: 'prompt',         text: 'git log --oneline --graph --all | head -6' },
  { kind: 'log',            text: '* 6d282e2 (HEAD -> master) feat: MeilisearchPanel on journal page' },
  { kind: 'log',            text: '* b7e9d1f (feat/meilisearch-integration) wip: search UI wiring' },
  { kind: 'log',            text: '* c3a2e8b (hotfix/ssl-cert-renewal) fix: renew wildcard cert' },
  { kind: 'log',            text: '* a4f8c2d feat: BgpLookupPanel on contact page; dispatches 884-886' },
  { kind: 'blank',          text: '' },
  { kind: 'comment',        text: '# Remove a worktree when done' },
  { kind: 'prompt',         text: 'git worktree remove ../construx-website-hotfix' },
  { kind: 'status-ok',      text: 'Removed worktree ../construx-website-hotfix' },
  { kind: 'status-mod',     text: '  pruned stale reference: refs/worktrees/construx-website-hotfix' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':         return 'rgba(240,239,255,0.22)';
    case 'prompt':          return 'rgba(240,239,255,0.6)';
    case 'worktree-main':   return '#4ade80';
    case 'worktree-branch': return '#67e8f9';
    case 'status-ok':       return '#4ade80';
    case 'status-mod':      return '#fbbf24';
    case 'log':             return '#a78bfa';
    default:                return 'transparent';
  }
}

export default function GitWorktreePanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveWorktrees, setLiveWorktrees] = useState(3);
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
            setLiveWorktrees(2 + Math.floor(Math.random() * 3));
          }, 2300);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 82;
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
          construx@dev — git worktree · parallel branch checkouts
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveWorktrees} trees` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git worktree · parallel checkouts · no stashing required
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>git 2.47 ·</span>
          <span style={{ color: '#4ade80' }}>{liveWorktrees} active worktrees</span>
          <span style={{ color: '#67e8f9' }}>shared .git object store</span>
          <span style={{ color: '#a78bfa' }}>no stash needed</span>
          <span style={{ color: '#fbbf24' }}>each tree: own index</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          git 2.47 · worktree · shared object store · independent indices
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● linked' : 'loading'}
        </span>
      </div>
    </div>
  );
}
