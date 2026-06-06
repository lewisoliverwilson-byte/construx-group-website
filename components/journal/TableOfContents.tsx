'use client';

import { useEffect, useRef, useState } from 'react';
import type { Heading } from '@/lib/headings';

interface Props {
  headings: Heading[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          break;
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0% -70% 0%',
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav
      className="hidden xl:flex flex-col sticky top-24 self-start w-52 flex-shrink-0 overflow-hidden"
      aria-label="Table of contents"
      style={{
        background: 'rgba(0,0,6,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '3px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="font-mono text-[8px] font-medium uppercase tracking-[0.2em]" style={{ color: 'rgba(249,115,22,0.6)' }}>
          // CONTENTS
        </span>
        <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {String(Math.round(progress)).padStart(3, '0')}%
        </span>
      </div>

      {/* Progress line */}
      <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full transition-none"
          style={{ width: `${progress}%`, background: 'rgba(249,115,22,0.4)' }}
        />
      </div>

      {/* Sections */}
      <div className="flex flex-col px-4 py-3 gap-0.5">
        {headings.map(({ id, text, level }, i) => {
          const isActive = activeId === id;
          const sectionNum = level === 2
            ? String(headings.filter((h, j) => h.level === 2 && j <= i).length).padStart(2, '0')
            : null;
          return (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-start gap-2 font-mono text-[9px] leading-relaxed group transition-colors duration-100"
              style={{
                paddingLeft: level === 3 ? '16px' : '0',
                color: isActive ? '#F97316' : 'rgba(240,239,255,0.3)',
              }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {sectionNum && (
                <span
                  className="flex-shrink-0 tabular-nums"
                  style={{ color: isActive ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.15)', minWidth: '16px' }}
                >
                  {sectionNum}.
                </span>
              )}
              <span
                className="truncate"
                style={{ borderLeft: isActive ? '1.5px solid rgba(249,115,22,0.5)' : '1.5px solid transparent', paddingLeft: '4px' }}
              >
                {text}
              </span>
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full animate-glow-pulse flex-shrink-0" style={{ background: '#4ade80' }} />
        <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.18)' }}>
          READING
        </span>
      </div>
    </nav>
  );
}
