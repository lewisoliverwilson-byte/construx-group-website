'use client';

interface Commit {
  hash: string;
  repo: string;
  repoColor: string;
  message: string;
  author: string;
  time: string;
  branch: string;
}

const COMMITS: Commit[] = [
  { hash: 'a3f2c91', repo: 'scoutr',  repoColor: '#F97316', message: 'feat: add batch mode for retailer scan pipeline',                  author: 'lewis',  time: '12m ago',  branch: 'main'    },
  { hash: 'b7d1e40', repo: 'construx-group-website', repoColor: '#a78bfa', message: 'feat: DmesgPanel on homepage; dispatches 451-453',                    author: 'lewis',  time: '38m ago',  branch: 'master'  },
  { hash: 'c8a4f22', repo: 'scoutr',  repoColor: '#F97316', message: 'fix: price-delta threshold not applying to filtered results',       author: 'lewis',  time: '2h ago',   branch: 'main'    },
  { hash: 'd1b9e55', repo: 'hyve',    repoColor: '#4ade80', message: 'feat: context-window compression for long channel histories',       author: 'dan',    time: '3h ago',   branch: 'main'    },
  { hash: 'e6c3a18', repo: 'marqet',  repoColor: '#7dd3fc', message: 'chore: regenerate embeddings with text-embedding-3-small',         author: 'lewis',  time: '5h ago',   branch: 'main'    },
  { hash: 'f2d7b31', repo: 'hyve',    repoColor: '#4ade80', message: 'refactor: simplify websocket connection pool management',           author: 'dan',    time: '7h ago',   branch: 'main'    },
  { hash: 'g9e1c84', repo: 'scoutr',  repoColor: '#F97316', message: 'perf: reduce scan worker memory footprint by 40%',                 author: 'lewis',  time: '9h ago',   branch: 'main'    },
  { hash: 'h4a8f62', repo: 'marqet',  repoColor: '#7dd3fc', message: 'feat: add admin moderation queue for new catalogue submissions',   author: 'lewis',  time: '11h ago',  branch: 'main'    },
  { hash: 'i7b2e19', repo: 'hyve',    repoColor: '#4ade80', message: 'fix: ai-agent losing context after 32-message thread',             author: 'dan',    time: '1d ago',   branch: 'main'    },
  { hash: 'j3c5a77', repo: 'construx-group-website', repoColor: '#a78bfa', message: 'feat: VentureHtopPanel on ventures; dispatches 454-456',             author: 'lewis',  time: '1d ago',   branch: 'master'  },
  { hash: 'k8d1f43', repo: 'scoutr',  repoColor: '#F97316', message: 'feat: webhook notifications for high-delta alerts',                author: 'lewis',  time: '2d ago',   branch: 'main'    },
  { hash: 'l2e6c08', repo: 'marqet',  repoColor: '#7dd3fc', message: 'docs: update README with new embedding pipeline architecture',    author: 'lewis',  time: '2d ago',   branch: 'main'    },
];

export default function RecentCommitsPanel() {
  return (
    <div
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.5)',
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
          construx@sys — git log — all repos
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          {COMMITS.length} commits
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git log --all --oneline --format=&apos;%h %C(bold)%s%C(reset) — %an %ar&apos;
        </span>
      </div>

      {/* Commits */}
      <div>
        {COMMITS.map((commit, i) => (
          <div
            key={commit.hash}
            className="flex items-start gap-3 px-4 py-2 text-[10px]"
            style={{ borderBottom: i < COMMITS.length - 1 ? '1px solid rgba(255,255,255,0.025)' : 'none' }}
          >
            {/* Hash */}
            <span
              className="flex-shrink-0 tabular-nums"
              style={{ color: 'rgba(74,222,128,0.5)', fontWeight: 600, minWidth: '52px' }}
            >
              {commit.hash}
            </span>

            {/* Repo badge */}
            <span
              className="flex-shrink-0 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-[2px]"
              style={{
                color: commit.repoColor,
                background: `${commit.repoColor}12`,
                border: `1px solid ${commit.repoColor}20`,
                minWidth: '52px',
                textAlign: 'center',
              }}
            >
              {commit.repo === 'construx-group-website' ? 'website' : commit.repo}
            </span>

            {/* Message */}
            <span
              className="flex-1 truncate"
              style={{ color: 'rgba(240,239,255,0.65)' }}
            >
              {commit.message}
            </span>

            {/* Author + time */}
            <div className="flex-shrink-0 flex items-center gap-2 text-[8px]">
              <span style={{ color: 'rgba(240,239,255,0.25)' }}>{commit.author}</span>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>{commit.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,4,0.5)' }}
      >
        <div className="flex items-center gap-3">
          {[
            { name: 'scoutr', color: '#F97316' },
            { name: 'marqet', color: '#7dd3fc' },
            { name: 'hyve', color: '#4ade80' },
            { name: 'website', color: '#a78bfa' },
          ].map((r) => (
            <span key={r.name} className="flex items-center gap-1 text-[8px]" style={{ color: `${r.color}80` }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
              {r.name}
            </span>
          ))}
        </div>
        <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.3)' }}>GitHub · 4 repos</span>
      </div>
    </div>
  );
}
