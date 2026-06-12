'use client';

import { useEffect, useRef } from 'react';

/**
 * The page spine: a line on the left margin that plots itself as you
 * scroll, with an orange pen nib at the drawing tip. The whole page
 * becomes one continuous drawing. Desktop only.
 */
export default function PlotterLine() {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const nibRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (fillRef.current) fillRef.current.style.transform = 'scaleY(1)';
      if (nibRef.current) nibRef.current.style.display = 'none';
      return;
    }

    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      if (nibRef.current) nibRef.current.style.top = `${p * 100}%`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="plotline-track left-6 hidden xl:block" aria-hidden="true">
      <div ref={fillRef} className="plotline-fill" style={{ height: '100%', transform: 'scaleY(0)' }} />
      <div ref={nibRef} className="plotline-nib" style={{ top: '0%' }} />
    </div>
  );
}
