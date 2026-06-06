'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { PostMeta } from '@/lib/posts';

interface NavItem {
  type: 'nav';
  label: string;
  path: string;
  shortcut: string;
}

interface PostItem {
  type: 'post';
  slug: string;
  title: string;
  tag: string;
  date: string;
  excerpt: string;
  dispatch: number;
}

type Result = NavItem | PostItem;

const NAV_ITEMS: NavItem[] = [
  { type: 'nav', label: 'Home', path: '/', shortcut: 'g+h' },
  { type: 'nav', label: 'Journal', path: '/journal', shortcut: 'g+j' },
  { type: 'nav', label: 'Ventures', path: '/ventures', shortcut: 'g+v' },
  { type: 'nav', label: 'Manifesto', path: '/manifesto', shortcut: 'g+m' },
  { type: 'nav', label: 'Founders', path: '/founders', shortcut: 'g+f' },
  { type: 'nav', label: 'Work With Us', path: '/work-with-us', shortcut: 'g+w' },
];

const TAG_COLORS: Record<string, string> = {
  'Build Log': 'rgba(59,130,246,0.25)',
  'Strategy': 'rgba(168,85,247,0.25)',
  'Product': 'rgba(34,197,94,0.25)',
  'Process': 'rgba(234,179,8,0.25)',
  'Methodology': 'rgba(20,184,166,0.25)',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

interface Props {
  posts: PostMeta[];
}

export default function CommandPalette({ posts }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const onClose = useCallback(() => setOpen(false), []);

  const annotated = posts.map((p, i) => ({ ...p, dispatch: posts.length - i }));

  const lq = query.trim().toLowerCase();

  const filteredNav: NavItem[] = lq.length < 1
    ? NAV_ITEMS
    : NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(lq));

  const filteredPosts: PostItem[] = lq.length < 2
    ? annotated.slice(0, lq.length === 0 ? 5 : 0).map((p) => ({ type: 'post' as const, ...p }))
    : annotated
        .filter(
          (p) =>
            p.title.toLowerCase().includes(lq) ||
            p.excerpt.toLowerCase().includes(lq) ||
            p.tag.toLowerCase().includes(lq)
        )
        .slice(0, 8)
        .map((p) => ({ type: 'post' as const, ...p }));

  const results: Result[] = [...filteredNav, ...filteredPosts];

  const go = useCallback(
    (result: Result) => {
      onClose();
      if (result.type === 'nav') {
        router.push(result.path);
      } else {
        router.push(`/journal/${result.slug}`);
      }
    },
    [router, onClose]
  );

  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handleCmdK);
    return () => window.removeEventListener('keydown', handleCmdK);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selected]) go(results[selected]);
      }
    },
    [open, results, selected, go, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!open) return null;

  const showNavSection = filteredNav.length > 0;
  const showPostSection = filteredPosts.length > 0;
  const navOffset = 0;
  const postOffset = filteredNav.length;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-5"
      style={{ background: 'rgba(0,0,8,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden"
        style={{
          background: 'rgba(4,4,16,0.99)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: '4px',
          boxShadow: '0 0 0 1px rgba(249,115,22,0.06), 0 32px 64px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* search bar */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="font-mono text-[11px] text-construx/60 select-none shrink-0">⌘K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH DISPATCHES, PAGES..."
            className="flex-1 bg-transparent outline-none font-mono text-[13px] text-text-primary placeholder:text-text-dim/40 uppercase tracking-wide"
            spellCheck={false}
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors uppercase tracking-widest shrink-0"
            >
              CLR
            </button>
          )}
        </div>

        {/* results */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '420px' }}>
          {results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
                NO RESULTS FOR &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {showNavSection && (
            <>
              <div className="px-4 pt-3 pb-1.5">
                <p className="font-mono text-[9px] text-text-dim/50 uppercase tracking-[0.2em]">PAGES</p>
              </div>
              {filteredNav.map((item, i) => {
                const idx = navOffset + i;
                const isSelected = selected === idx;
                return (
                  <button
                    key={item.path}
                    className="w-full flex items-center justify-between px-4 py-2.5 transition-colors text-left"
                    style={{
                      background: isSelected ? 'rgba(249,115,22,0.08)' : 'transparent',
                      borderLeft: isSelected ? '2px solid rgba(249,115,22,0.7)' : '2px solid transparent',
                    }}
                    onMouseEnter={() => setSelected(idx)}
                    onClick={() => go(item)}
                  >
                    <span
                      className="font-mono text-[12px] uppercase tracking-wide"
                      style={{ color: isSelected ? '#F97316' : 'rgba(240,239,255,0.7)' }}
                    >
                      {item.label}
                    </span>
                    <span className="font-mono text-[9px] text-text-dim/40 uppercase tracking-widest">
                      {item.shortcut}
                    </span>
                  </button>
                );
              })}
            </>
          )}

          {showPostSection && (
            <>
              <div className="px-4 pt-3 pb-1.5">
                <p className="font-mono text-[9px] text-text-dim/50 uppercase tracking-[0.2em]">
                  {lq.length < 2 ? 'RECENT DISPATCHES' : 'DISPATCHES'}
                </p>
              </div>
              {filteredPosts.map((post, i) => {
                const idx = postOffset + i;
                const isSelected = selected === idx;
                const tagColor = TAG_COLORS[post.tag] ?? 'rgba(255,255,255,0.08)';
                return (
                  <button
                    key={post.slug}
                    className="w-full flex items-start gap-3 px-4 py-2.5 transition-colors text-left"
                    style={{
                      background: isSelected ? 'rgba(249,115,22,0.08)' : 'transparent',
                      borderLeft: isSelected ? '2px solid rgba(249,115,22,0.7)' : '2px solid transparent',
                    }}
                    onMouseEnter={() => setSelected(idx)}
                    onClick={() => go(post)}
                  >
                    <span
                      className="font-mono text-[10px] shrink-0 mt-0.5 tabular-nums"
                      style={{ color: 'rgba(249,115,22,0.4)' }}
                    >
                      #{String(post.dispatch).padStart(3, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-mono text-[12px] uppercase tracking-wide truncate"
                        style={{ color: isSelected ? '#F97316' : 'rgba(240,239,255,0.75)' }}
                      >
                        {post.title}
                      </p>
                      {isSelected && (
                        <p className="font-mono text-[9px] text-text-dim/50 mt-0.5 line-clamp-1 normal-case">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <span
                        className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5"
                        style={{
                          background: tagColor,
                          color: 'rgba(240,239,255,0.5)',
                          borderRadius: '2px',
                        }}
                      >
                        {post.tag}
                      </span>
                      <span className="font-mono text-[9px] text-text-dim/30 uppercase tracking-widest">
                        {formatDate(post.date)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* footer */}
        <div
          className="flex items-center gap-4 px-4 py-2.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {[
            ['↑↓', 'navigate'],
            ['↵', 'open'],
            ['ESC', 'close'],
          ].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5">
              <kbd
                className="font-mono text-[9px] px-1 py-0.5 bg-white/5 border border-white/10"
                style={{ borderRadius: '2px' }}
              >
                {key}
              </kbd>
              <span className="font-mono text-[9px] text-text-dim/40 uppercase tracking-widest">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
