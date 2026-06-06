'use client';

import { useState, useEffect, useRef } from 'react';

interface LintFile {
  path:     string;
  errors:   number;
  warnings: number;
  issues:   LintIssue[];
}

interface LintIssue {
  line:   number;
  col:    number;
  sev:    'error' | 'warning';
  rule:   string;
  msg:    string;
}

const FILES: LintFile[] = [
  { path: 'src/app/page.tsx',           errors: 0, warnings: 0, issues: [] },
  { path: 'src/app/api/posts/route.ts', errors: 0, warnings: 0, issues: [] },
  {
    path:     'src/components/PostCard.tsx',
    errors:   0,
    warnings: 1,
    issues: [
      { line: 44, col: 7, sev: 'warning', rule: 'react/display-name', msg: 'Component definition is missing display name' },
    ],
  },
  { path: 'src/lib/auth.ts',            errors: 0, warnings: 0, issues: [] },
  { path: 'src/lib/db.ts',              errors: 0, warnings: 0, issues: [] },
  {
    path:     'src/hooks/useDebounce.ts',
    errors:   0,
    warnings: 1,
    issues: [
      { line: 12, col: 3, sev: 'warning', rule: '@typescript-eslint/no-explicit-any', msg: 'Unexpected any. Specify a different type' },
    ],
  },
  { path: 'src/app/dashboard/page.tsx', errors: 0, warnings: 0, issues: [] },
  { path: 'src/middleware.ts',           errors: 0, warnings: 0, issues: [] },
  { path: 'src/app/layout.tsx',          errors: 0, warnings: 0, issues: [] },
  { path: 'src/lib/stripe.ts',           errors: 0, warnings: 0, issues: [] },
  {
    path:     'src/utils/format.ts',
    errors:   0,
    warnings: 1,
    issues: [
      { line: 28, col: 14, sev: 'warning', rule: 'prefer-const', msg: "'result' is never reassigned. Use 'const' instead" },
    ],
  },
  { path: 'src/app/api/auth/route.ts',  errors: 0, warnings: 0, issues: [] },
];

function sevColor(sev: LintIssue['sev']): string {
  return sev === 'error' ? '#f87171' : '#fbbf24';
}

function fileStatusColor(f: LintFile): string {
  if (f.errors > 0)   return '#f87171';
  if (f.warnings > 0) return '#fbbf24';
  return '#4ade80';
}

function fileStatusIcon(f: LintFile): string {
  if (f.errors > 0)   return '✗';
  if (f.warnings > 0) return '△';
  return '✓';
}

export default function EslintOutputPanel() {
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
    if (revealed === 0 || revealed > FILES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 90);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > FILES.length;
  const displayed = FILES.slice(0, allDone ? FILES.length : revealed);

  const totalErrors   = displayed.reduce((s, f) => s + f.errors, 0);
  const totalWarnings = displayed.reduce((s, f) => s + f.warnings, 0);
  const allPassed     = allDone && totalErrors === 0;

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
          construx@sys — eslint --max-warnings=0 src/
        </span>
        <span
          className="text-[8px] uppercase tracking-widest tabular-nums"
          style={{ color: allDone ? (allPassed ? 'rgba(74,222,128,0.5)' : 'rgba(251,191,36,0.5)') : 'rgba(240,239,255,0.2)' }}
        >
          {allDone ? `${FILES.length} files` : 'linting…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>npx eslint --max-warnings=0 --format=compact src/</span>
      </div>

      {/* File results */}
      <div className="px-4 py-2 space-y-0.5">
        {displayed.map((file, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 text-[8px] leading-[1.7]">
              <span style={{ color: fileStatusColor(file), fontWeight: 700, width: '12px', flexShrink: 0 }}>
                {fileStatusIcon(file)}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.55)' }}>
                {file.path}
              </span>
              {file.warnings > 0 && (
                <span style={{ color: '#fbbf24', marginLeft: 'auto', flexShrink: 0, fontSize: '7px' }}>
                  {file.warnings}W
                </span>
              )}
            </div>
            {file.issues.map((issue, j) => (
              <div key={j} className="flex items-start gap-2 text-[7.5px] leading-[1.65] pl-5 mt-0.5">
                <span style={{ color: 'rgba(240,239,255,0.25)', flexShrink: 0, minWidth: '56px' }}>
                  {file.path.split('/').pop()}:{issue.line}:{issue.col}
                </span>
                <span style={{ color: sevColor(issue.sev), flexShrink: 0, minWidth: '44px' }}>
                  {issue.sev}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.45)' }}>
                  {issue.msg}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.2)', flexShrink: 0, marginLeft: 'auto' }}>
                  {issue.rule}
                </span>
              </div>
            ))}
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="px-4 py-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          <div className="text-[8px]" style={{ color: totalErrors > 0 ? '#f87171' : totalWarnings > 0 ? '#fbbf24' : '#4ade80' }}>
            {totalErrors > 0
              ? `✗ ${totalErrors} error${totalErrors > 1 ? 's' : ''}, ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`
              : totalWarnings > 0
              ? `△ 0 errors, ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''} (--max-warnings exceeded)`
              : `✓ ${FILES.length} files passed with 0 errors, 0 warnings`
            }
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          ESLint 9 · typescript-eslint 8 · next/eslint-plugin-next
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? (allPassed ? 'rgba(74,222,128,0.35)' : 'rgba(251,191,36,0.35)') : 'rgba(240,239,255,0.15)' }}>
          {allDone ? (allPassed ? '● pass' : '△ warnings') : 'linting'}
        </span>
      </div>
    </div>
  );
}
