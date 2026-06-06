'use client';

import { useState, useEffect, useRef } from 'react';

interface CommitLine {
  graph:   string;
  hash:    string;
  date:    string;
  message: string;
  refs?:   string;
  accent?: string;
  blank?:  boolean;
}

const GRAPH_LINES: CommitLine[] = [
  { graph: '*',       hash: 'a4f2c91', date: '2029-02-18', message: 'feat: Hyve AI context pipeline v3',         refs: 'HEAD → main, origin/main', accent: '#4ade80' },
  { graph: '|',       hash: '',        date: '',            message: '', blank: true },
  { graph: '*',       hash: 'b7d3e82', date: '2029-02-14', message: 'feat: Marqet taxonomy — 167 listings',      accent: '#7dd3fc' },
  { graph: '|\\',     hash: '',        date: '',            message: '', blank: true },
  { graph: '* |',     hash: 'c1a8f04', date: '2029-02-12', message: 'fix: Scoutr batch output sort regression',  accent: '#F97316' },
  { graph: '| *',     hash: 'd9e2b73', date: '2029-02-10', message: 'feat: Hyve WebSocket presence indicators',  accent: '#4ade80' },
  { graph: '| |',     hash: '',        date: '',            message: '', blank: true },
  { graph: '*\\|',    hash: 'e5f7c19', date: '2029-02-08', message: 'feat: Marqet embed-worker — async indexing', accent: '#7dd3fc' },
  { graph: '|\\ \\',  hash: '',        date: '',            message: '', blank: true },
  { graph: '* | |',   hash: 'f3d4a56', date: '2029-02-05', message: 'feat: pgvector semantic search — Scoutr',   accent: '#F97316' },
  { graph: '| * |',   hash: 'a8c2f91', date: '2029-02-03', message: 'chore: postgres replica failover tested',   accent: '#a78bfa' },
  { graph: '| | *',   hash: 'b6e9d27', date: '2029-02-01', message: 'feat: Hyve AI agent — retrieval pipeline',  accent: '#4ade80' },
  { graph: '| | |',   hash: '',        date: '',            message: '', blank: true },
  { graph: '|/ /',    hash: '',        date: '',            message: '', blank: true },
  { graph: '*',       hash: 'c4f1b88', date: '2029-01-28', message: 'release: construx-group-website v2.0',      refs: 'tag: v2.0',  accent: '#fbbf24' },
  { graph: '|\\',     hash: '',        date: '',            message: '', blank: true },
  { graph: '* |',     hash: 'd7a3c02', date: '2029-01-24', message: 'feat: Marqet partner API v2 — auth layer',  accent: '#7dd3fc' },
  { graph: '| *',     hash: 'e2f8b64', date: '2029-01-21', message: 'dispatch: 500 — compounding in public',     accent: '#a78bfa' },
  { graph: '| |',     hash: '',        date: '',            message: '', blank: true },
  { graph: '* |',     hash: 'f9d1e37', date: '2029-01-18', message: 'feat: Scoutr — Checkly uptime monitors',    accent: '#F97316' },
  { graph: '| *',     hash: 'a5c7f82', date: '2029-01-15', message: 'feat: Hyve — channel archiving',            accent: '#4ade80' },
  { graph: '|/ ',     hash: '',        date: '',            message: '', blank: true },
  { graph: '*',       hash: 'b1d4a09', date: '2029-01-12', message: 'feat: Lattice landing — demand test live',  accent: '#a78bfa' },
  { graph: '*',       hash: 'c8e3f51', date: '2029-01-09', message: 'feat: construx.io — SslCertPanel, WhoisPanel', accent: '#7dd3fc' },
  { graph: '*',       hash: 'd6f2c74', date: '2029-01-06', message: 'chore: Amplify env vars — Resend configured', accent: '#fbbf24' },
];

export default function GitGraphPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > GRAPH_LINES.length) return;
    const line  = GRAPH_LINES[revealed - 1];
    const delay = line.blank ? 18 : 60;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const visibleLines = GRAPH_LINES.slice(0, revealed);
  const done = revealed > GRAPH_LINES.length;

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
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
          construx@sys — git history
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {GRAPH_LINES.filter((l) => l.hash).length} commits
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git log --oneline --graph --decorate --all
        </span>
      </div>

      {/* Graph */}
      <div className="px-4 py-3 space-y-0">
        {visibleLines.map((line, i) => {
          if (line.blank) {
            return (
              <div key={i} className="text-[9px] leading-none" style={{ color: 'rgba(255,255,255,0.18)' }}>
                {line.graph}
              </div>
            );
          }

          return (
            <div key={i} className="flex items-center gap-2 text-[8px] leading-relaxed">
              <span className="flex-shrink-0 w-8 text-right tabular-nums" style={{ color: line.accent ?? 'rgba(240,239,255,0.35)', fontSize: '9px' }}>
                {line.graph}
              </span>
              {line.hash && (
                <span className="flex-shrink-0 tabular-nums" style={{ color: 'rgba(240,239,255,0.22)' }}>
                  {line.hash}
                </span>
              )}
              <span className="flex-shrink-0 tabular-nums" style={{ color: 'rgba(255,255,255,0.15)', minWidth: '78px' }}>
                {line.date}
              </span>
              <span className="truncate" style={{ color: line.accent ? `${line.accent}cc` : 'rgba(240,239,255,0.55)' }}>
                {line.message}
              </span>
              {line.refs && (
                <span className="flex-shrink-0 text-[7px] px-1 py-px" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.1)', borderRadius: '2px' }}>
                  {line.refs}
                </span>
              )}
            </div>
          );
        })}

        {!done && revealed > 0 && (
          <div className="text-[8px] animate-pulse" style={{ color: 'rgba(74,222,128,0.5)' }}>▋</div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          construx-group-website · all branches
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          git 2.44
        </span>
      </div>
    </div>
  );
}
