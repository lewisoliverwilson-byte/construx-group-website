'use client';

import { useEffect, useRef, useState } from 'react';
import type { Heading } from '@/lib/headings';

interface Props {
  headings: Heading[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

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
      className="hidden xl:block sticky top-24 self-start w-52 flex-shrink-0"
      aria-label="Table of contents"
    >
      <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-text-dim mb-3">
        // CONTENTS
      </p>
      <div className="flex flex-col gap-0.5">
        {headings.map(({ id, text, level }) => {
          const isActive = activeId === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              className="block font-mono text-[10px] leading-relaxed transition-colors"
              style={{
                paddingLeft: level === 3 ? '10px' : '0',
                color: isActive ? '#F97316' : 'rgba(240,239,255,0.35)',
                borderLeft: isActive ? '2px solid #F97316' : '2px solid transparent',
                paddingRight: '4px',
                marginLeft: level === 3 ? '6px' : '0',
              }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {text}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
