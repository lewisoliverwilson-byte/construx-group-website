'use client';

import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';

interface Props {
  posts: PostMeta[];
  totalPosts: number;
}

type LogEntry =
  | { kind: 'dispatch'; post: PostMeta; num: number; ts: string }
  | { kind: 'sys'; level: string; label: string; pid: string; msg: string; ts: string };

const DISPATCH_TIMES = [
  '09:14:03', '14:22:47', '11:03:21', '16:44:08',
  '08:57:34', '13:19:52', '10:31:16', '17:05:40',
];

const LEVEL_COLOR: Record<string, string> = {
  BOOT: '#4ade80',
  NET:  '#67e8f9',
  AI:   '#a78bfa',
  HLTH: '#34d399',
  BILD: '#86efac',
  DSPX: '#F97316',
};

export default function SystemLog({ posts, totalPosts }: Props) {
  const d = (i: number): LogEntry | null =>
    posts[i]
      ? {
          kind: 'dispatch',
          post: posts[i],
          num: totalPosts - i,
          ts: `${posts[i].date} ${DISPATCH_TIMES[i] ?? '00:00:00'}`,
        }
      : null;

  const sys = (level: string, label: string, pid: string, msg: string, ts: string): LogEntry => ({
    kind: 'sys', level, label, pid, msg, ts,
  });

  const raw: (LogEntry | null)[] = [
    sys('BOOT', 'BOOT', '0001', 'construx/runtime init ok · 3 ventures registered · uptime tracking started', '2026-07-07 00:00:01'),
    d(0), d(1),
    sys('NET', 'NET ', '0847', 'edge cdn online · 14 PoPs active · avg latency 11ms · ssl/tls ok', '2026-07-05 14:22:11'),
    d(2), d(3),
    sys('AI', 'AI  ', '2341', 'claude-api · 847k tokens/day · p50 312ms · p99 1.8s · quota ok', '2026-07-03 09:41:33'),
    d(4), d(5),
    sys('HLTH', 'HLTH', '0091', 'scoutr.io → 200 OK | themarqet.shop → 200 OK | thehyve.io → 200 OK', '2026-07-01 06:00:00'),
    d(6),
    sys('BILD', 'BILD', '0104', `deploy d3dpr3doar5fjy · sha:a4f3d · ok · ${totalPosts} posts indexed`, '2026-06-30 18:22:47'),
    d(7),
  ];

  const entries = raw.filter((e): e is LogEntry => e !== null);
  const earlier = Math.max(0, totalPosts - 8);

  return (
    <section className="px-5 pb-12 mx-auto max-w-5xl" aria-label="Recent system activity">
      <div
        className="overflow-hidden"
        style={{
          background: 'rgba(1,1,10,0.96)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 select-none"
          style={{
            background: 'rgba(255,255,255,0.025)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px rgba(255,95,87,0.5)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
          </div>
          <p className="font-mono text-[9px] text-text-dim tracking-wide flex-1 text-center">
            construx@sys — tail /var/log/construx/dispatch.log
          </p>
          <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
            bash — 120×40
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-5 overflow-x-auto">
          {/* Shell prompt */}
          <div className="flex items-center gap-1.5 mb-4">
            <span className="font-mono text-[10px] font-medium" style={{ color: '#4ade80' }}>construx@sys</span>
            <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>:~$</span>
            <span className="font-mono text-[10px] ml-1" style={{ color: 'rgba(240,239,255,0.45)' }}>
              tail -f /var/log/construx/dispatch.log
            </span>
          </div>

          {/* Log entries */}
          <div className="flex flex-col" style={{ gap: '3px' }}>
            {entries.map((entry, i) => {
              const levelKey = entry.kind === 'dispatch' ? 'DSPX' : entry.level;
              const labelText = entry.kind === 'dispatch' ? 'DSPX' : entry.label;
              const pidText = entry.kind === 'dispatch'
                ? String(entry.num).padStart(4, '0')
                : entry.pid;

              return (
                <div
                  key={i}
                  className="log-entry flex items-baseline gap-0 min-w-0"
                  style={{ animationDelay: `${i * 55}ms` }}
                >
                  {/* Timestamp */}
                  <span
                    className="font-mono text-[9px] tabular-nums flex-shrink-0 mr-3"
                    style={{ color: 'rgba(255,255,255,0.14)', minWidth: '155px' }}
                  >
                    {entry.ts}
                  </span>

                  {/* Level */}
                  <span
                    className="font-mono text-[9px] font-semibold flex-shrink-0 mr-3"
                    style={{
                      color: LEVEL_COLOR[levelKey] ?? 'rgba(255,255,255,0.3)',
                      minWidth: '46px',
                    }}
                  >
                    [{labelText}]
                  </span>

                  {/* PID */}
                  <span
                    className="font-mono text-[9px] tabular-nums flex-shrink-0 mr-3"
                    style={{ color: 'rgba(255,255,255,0.13)', minWidth: '36px' }}
                  >
                    {pidText}
                  </span>

                  {/* Message */}
                  {entry.kind === 'dispatch' ? (
                    <Link
                      href={`/journal/${entry.post.slug}`}
                      className="log-dispatch-link font-mono text-[9px] leading-relaxed min-w-0"
                    >
                      {entry.post.title}
                    </Link>
                  ) : (
                    <span
                      className="font-mono text-[9px] leading-relaxed min-w-0"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                    >
                      {entry.msg}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer line */}
          <div
            className="flex items-center gap-3 mt-4 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.12)' }}>...</span>
            <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
              {earlier} EARLIER ENTRIES
            </span>
            <Link
              href="/journal"
              className="font-mono text-[9px] uppercase tracking-widest log-view-all ml-1"
            >
              VIEW ALL →
            </Link>
            <span
              className="inline-block w-1.5 h-3.5 ml-auto animate-glow-pulse"
              style={{ background: 'rgba(249,115,22,0.55)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
