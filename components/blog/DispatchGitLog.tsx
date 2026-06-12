import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';

const TAG_COLOR: Record<string, string> = {
  Strategy:    '#F97316',
  'Build Log': '#4ade80',
  Product:     '#7dd3fc',
  Methodology: '#a78bfa',
  Process:     '#67e8f9',
};

function shortHash(slug: string): string {
  let hash = 0;
  for (const c of slug) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return (hash >>> 0).toString(16).slice(0, 7).padEnd(7, '0');
}

interface Props {
  posts: PostMeta[];
  total: number;
}

export default function DispatchGitLog({ posts, total }: Props) {
  const shown = posts.slice(0, 8);

  return (
    <div
      className="mt-6 overflow-hidden"
      style={{
        background: 'rgba(0,0,6,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '4px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          construx.journal — git log --oneline --all
        </span>
        <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(249,115,22,0.4)' }}>
          {String(total).padStart(3, '0')} commits
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
        <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git log --oneline --no-walk --branch=dispatches --limit=8
        </span>
      </div>

      {/* Git log entries */}
      <div className="flex flex-col">
        {shown.map((post, i) => {
          const hash = shortHash(post.slug);
          const accent = TAG_COLOR[post.tag] ?? '#F97316';
          const isLast = i === shown.length - 1;
          return (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="group flex items-baseline gap-3 px-4 py-2 hover:bg-white/[0.03] transition-colors"
              style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.03)' }}
            >
              {/* Hash */}
              <span
                className="font-mono text-[9px] tabular-nums flex-shrink-0 group-hover:opacity-100 transition-opacity"
                style={{ color: accent, opacity: 0.7 }}
              >
                {hash}
              </span>
              {/* Commit line graph */}
              <span
                className="font-mono text-[9px] flex-shrink-0"
                style={{ color: `${accent}40` }}
              >
                ●
              </span>
              {/* Title */}
              <span
                className="font-mono text-[9px] flex-1 min-w-0 truncate group-hover:text-white/80 transition-colors"
                style={{ color: 'rgba(240,239,255,0.55)' }}
              >
                {post.tag.toLowerCase()}: {post.title}
              </span>
              {/* Date */}
              <span
                className="font-mono text-[9px] tabular-nums flex-shrink-0"
                style={{ color: 'rgba(255,255,255,0.15)' }}
              >
                {post.date}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
      >
        <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
          ...{total - shown.length} earlier commits
        </span>
        <span className="font-mono text-[8px]" style={{ color: 'rgba(249,115,22,0.3)' }}>
          HEAD → dispatches
        </span>
      </div>
    </div>
  );
}
