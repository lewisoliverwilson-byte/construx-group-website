'use client';

import { useState, useEffect, useRef } from 'react';

interface AuthorRepo {
  repo: string;
  commits: number;
  color: string;
}

interface Author {
  name: string;
  email: string;
  handle: string;
  color: string;
  total: number;
  repos: AuthorRepo[];
  additions: string;
  deletions: string;
}

const AUTHORS: Author[] = [
  {
    name: 'Lewis Wilson',
    email: 'lewis@construxgroup.io',
    handle: 'lewisoliverwilson-byte',
    color: '#F97316',
    total: 847,
    additions: '+312,441',
    deletions: '-89,203',
    repos: [
      { repo: 'scoutr',   commits: 312, color: '#F97316' },
      { repo: 'website',  commits: 211, color: '#a78bfa' },
      { repo: 'the-hyve', commits: 189, color: '#4ade80' },
      { repo: 'marqet',   commits: 135, color: '#7dd3fc' },
    ],
  },
  {
    name: 'Dan',
    email: 'dan@construxgroup.io',
    handle: 'construx-dan',
    color: '#8B5CF6',
    total: 394,
    additions: '+48,912',
    deletions: '-12,880',
    repos: [
      { repo: 'the-hyve', commits: 147, color: '#4ade80' },
      { repo: 'marqet',   commits: 112, color: '#7dd3fc' },
      { repo: 'website',  commits:  89, color: '#a78bfa' },
      { repo: 'scoutr',   commits:  46, color: '#F97316' },
    ],
  },
];

const TOTAL = AUTHORS.reduce((sum, a) => sum + a.total, 0);

export default function GitShortlogPanel() {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true); },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
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
          construx@sys — contribution stats
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          {TOTAL} commits
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git shortlog -sn --all --no-merges --since=&quot;1 year ago&quot;
        </span>
      </div>

      {/* Authors */}
      <div className="px-4 py-4 space-y-5">
        {AUTHORS.map((author, ai) => (
          <div key={author.email}>
            {/* Header row */}
            <div className="flex items-baseline gap-3 mb-2.5">
              <span
                className="text-[10px] font-semibold tabular-nums"
                style={{ color: author.color, minWidth: '36px' }}
              >
                {String(author.total).padStart(4, ' ')}
              </span>
              <span className="text-[9px]" style={{ color: 'rgba(240,239,255,0.7)' }}>
                {author.name}
              </span>
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                &lt;{author.email}&gt;
              </span>
              <span className="ml-auto text-[8px] tabular-nums" style={{ color: 'rgba(74,222,128,0.5)' }}>
                {author.additions}
              </span>
              <span className="text-[8px] tabular-nums" style={{ color: 'rgba(248,113,113,0.5)' }}>
                {author.deletions}
              </span>
            </div>

            {/* Overall bar */}
            <div
              className="h-1 mb-3 rounded-sm overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="h-full rounded-sm"
                style={{
                  width: revealed ? `${(author.total / TOTAL) * 100}%` : '0%',
                  background: author.color,
                  opacity: 0.7,
                  transition: `width 0.8s cubic-bezier(0.22,1,0.36,1) ${ai * 120}ms`,
                  boxShadow: `0 0 6px ${author.color}55`,
                }}
              />
            </div>

            {/* Per-repo breakdown */}
            <div className="space-y-1.5 pl-10">
              {author.repos.map((repo, ri) => (
                <div key={repo.repo} className="flex items-center gap-3">
                  <span
                    className="text-[8px] uppercase tracking-widest"
                    style={{ color: repo.color, minWidth: '60px' }}
                  >
                    {repo.repo}
                  </span>
                  <div
                    className="flex-1 h-0.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div
                      style={{
                        width: revealed ? `${(repo.commits / author.total) * 100}%` : '0%',
                        height: '100%',
                        background: repo.color,
                        opacity: 0.5,
                        transition: `width 0.7s cubic-bezier(0.22,1,0.36,1) ${ai * 120 + ri * 80 + 200}ms`,
                      }}
                    />
                  </div>
                  <span className="text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {repo.commits}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          all repos · last 12 months
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.4)' }}>
          {AUTHORS.length} contributors
        </span>
      </div>
    </div>
  );
}
