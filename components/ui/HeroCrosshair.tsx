'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Drafting-table crosshair: full-width/height guide lines follow the cursor
 * across the hero with a live coordinate readout. Desktop pointers only.
 */
export default function HeroCrosshair() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const host = hostRef.current?.parentElement;
    if (!host) return;

    const onMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onLeave = () => setPos(null);

    host.addEventListener('mousemove', onMove, { passive: true });
    host.addEventListener('mouseleave', onLeave);
    return () => {
      host.removeEventListener('mousemove', onMove);
      host.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0 pointer-events-none hidden lg:block" aria-hidden="true">
      {pos && (
        <>
          <span
            className="crosshair-line"
            style={{ left: pos.x, top: 0, bottom: 0, width: 1 }}
          />
          <span
            className="crosshair-line"
            style={{ top: pos.y, left: 0, right: 0, height: 1 }}
          />
          <span
            className="crosshair-readout"
            style={{ left: pos.x + 14, top: pos.y + 14 }}
          >
            X {String(Math.round(pos.x)).padStart(4, '0')} · Y {String(Math.round(pos.y)).padStart(4, '0')}
          </span>
        </>
      )}
    </div>
  );
}
