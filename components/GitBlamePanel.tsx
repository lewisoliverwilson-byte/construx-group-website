'use client';

import { useState, useEffect, useRef } from 'react';

interface BlameLine {
  hash:    string;
  author:  string;
  date:    string;
  lineNum: number;
  code:    string;
  isNew:   boolean;
}

const BLAME: BlameLine[] = [
  { hash: 'a3f9b2c', author: 'lewis',  date: '2030-11-18', lineNum:  1, code: "import { getAllPostMeta } from '@/lib/posts';",                        isNew: false },
  { hash: 'a3f9b2c', author: 'lewis',  date: '2030-11-18', lineNum:  2, code: "import { formatDate }    from '@/lib/utils';",                          isNew: false },
  { hash: 'a3f9b2c', author: 'lewis',  date: '2030-11-18', lineNum:  3, code: "import { z }             from 'zod';",                                  isNew: false },
  { hash: 'd8e1f4a', author: 'claude', date: '2030-11-22', lineNum:  4, code: '',                                                                       isNew: false },
  { hash: 'd8e1f4a', author: 'claude', date: '2030-11-22', lineNum:  5, code: 'const PostMetaSchema = z.object({',                                     isNew: false },
  { hash: 'd8e1f4a', author: 'claude', date: '2030-11-22', lineNum:  6, code: "  title:  z.string(),",                                                 isNew: false },
  { hash: 'd8e1f4a', author: 'claude', date: '2030-11-22', lineNum:  7, code: "  date:   z.string(),",                                                 isNew: false },
  { hash: 'd8e1f4a', author: 'claude', date: '2030-11-22', lineNum:  8, code: "  tag:    z.string().optional(),",                                      isNew: false },
  { hash: 'd8e1f4a', author: 'claude', date: '2030-11-22', lineNum:  9, code: "  author: z.string(),",                                                 isNew: false },
  { hash: 'd8e1f4a', author: 'claude', date: '2030-11-22', lineNum: 10, code: '});',                                                                   isNew: false },
  { hash: 'b7c2d9e', author: 'lewis',  date: '2030-11-30', lineNum: 11, code: '',                                                                       isNew: false },
  { hash: 'b7c2d9e', author: 'lewis',  date: '2030-11-30', lineNum: 12, code: 'export async function getAllPostMeta() {',                               isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 13, code: "  const files = await glob('content/journal/*.mdx');",                  isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 14, code: '  const posts = await Promise.all(',                                    isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 15, code: "    files.map(async (f) => {",                                          isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 16, code: "      const raw  = await readFile(f, 'utf8');",                         isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 17, code: "      const { data } = matter(raw);",                                   isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 18, code: "      const slug = path.basename(f, '.mdx');",                          isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 19, code: "      return PostMetaSchema.parse({ ...data, slug });",                 isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 20, code: '    }),',                                                               isNew: false },
  { hash: '1f2e3d4', author: 'claude', date: '2030-12-02', lineNum: 21, code: '  );',                                                                   isNew: false },
  { hash: 'e5f6a7b', author: 'lewis',  date: '2030-12-10', lineNum: 22, code: "  return posts.sort((a, b) => b.date.localeCompare(a.date));",           isNew: true  },
  { hash: 'e5f6a7b', author: 'lewis',  date: '2030-12-10', lineNum: 23, code: '}',                                                                      isNew: false },
];

function authorColor(author: string): string {
  return author === 'lewis' ? '#f97316' : '#60a5fa';
}

function hashColor(hash: string): string {
  return hash.startsWith('e5') ? '#fbbf24' : 'rgba(240,239,255,0.2)';
}

export default function GitBlamePanel() {
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
    if (revealed === 0 || revealed > BLAME.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone    = revealed > BLAME.length;
  const displayed  = BLAME.slice(0, allDone ? BLAME.length : revealed);
  const lewisLines = BLAME.filter((l) => l.author === 'lewis').length;
  const aiLines    = BLAME.filter((l) => l.author === 'claude').length;

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
          construx@sys — git blame lib/posts.ts
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${BLAME.length} lines` : 'annotating…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git blame --date=short -s src/lib/posts.ts
        </span>
      </div>

      {/* Blame lines */}
      <div className="px-4 py-1.5 space-y-0">
        {displayed.map((line, i) => (
          <div
            key={i}
            className="flex items-start text-[7.5px] leading-[1.7]"
            style={{
              background: line.isNew ? 'rgba(251,191,36,0.04)' : 'transparent',
              borderLeft: line.isNew ? '2px solid rgba(251,191,36,0.35)' : '2px solid transparent',
              paddingLeft: '2px',
            }}
          >
            <span style={{ color: hashColor(line.hash), minWidth: '52px', flexShrink: 0 }}>
              {line.hash}
            </span>
            <span style={{ color: authorColor(line.author), minWidth: '52px', flexShrink: 0, fontWeight: 600 }}>
              ({line.author}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '76px', flexShrink: 0 }}>
              {line.date}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '28px', flexShrink: 0, textAlign: 'right' }}>
              {line.lineNum})
            </span>
            <span className="ml-2" style={{ color: line.code === '' ? 'transparent' : 'rgba(240,239,255,0.55)', whiteSpace: 'pre' }}>
              {line.code || ' '}
            </span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-4 px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#f97316' }}>{lewisLines} lines by lewis</span>
          <span style={{ color: '#60a5fa' }}>{aiLines} lines by claude</span>
          <span className="ml-auto">4 commits · 2 authors</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          git 2.47.0 · src/lib/posts.ts · master
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● annotated' : 'loading'}
        </span>
      </div>
    </div>
  );
}
