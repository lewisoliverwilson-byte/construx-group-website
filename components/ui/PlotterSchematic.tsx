'use client';

import { useEffect, useRef } from 'react';

const PRODUCTS = ['SCOUTR', 'THE MARQET', 'THE HYVE', 'CONSTRUX DAILY', 'CONSTRUX STUDIO'];

/**
 * The studio system as a self-drawing blueprint: Claude (build engine)
 * feeding five product nodes through an orange trunk line.
 * Strokes draw in plotter-order on mount.
 */
export default function PlotterSchematic({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('plotted');
      return;
    }
    const t = setTimeout(() => el.classList.add('plotted'), 500);
    return () => clearTimeout(t);
  }, []);

  const ink = 'var(--ink)';
  const muted = 'var(--ink-faint)';
  const orange = 'var(--orange)';

  return (
    <svg
      ref={ref}
      viewBox="0 0 440 330"
      fill="none"
      className={className}
      aria-label="Schematic: Claude as build engine feeding five products"
      role="img"
    >
      {/* FIG label */}
      <text x="0" y="14" className="plot-label" style={{ transitionDelay: '200ms' }} fill={muted} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5">
        FIG. A — STUDIO SYSTEM
      </text>

      {/* Engine block */}
      <rect x="8" y="92" width="148" height="92" stroke={ink} strokeWidth="1.5" pathLength={1} className="plot-path" />
      {/* X mark inside engine */}
      <path d="M 40 118 L 76 154 M 76 118 L 40 154" stroke={ink} strokeWidth="6" pathLength={1} className="plot-path" style={{ transitionDelay: '300ms' }} />
      <path d="M 66 128 L 76 118" stroke={orange} strokeWidth="6" pathLength={1} className="plot-path" style={{ transitionDelay: '550ms' }} />
      <text x="94" y="130" className="plot-label" style={{ transitionDelay: '600ms' }} fill={ink} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1">
        CLAUDE
      </text>
      <text x="94" y="146" className="plot-label" style={{ transitionDelay: '650ms' }} fill={muted} fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1">
        BUILD ENGINE
      </text>

      {/* Orange trunk: engine → bus */}
      <path d="M 156 138 L 210 138" stroke={orange} strokeWidth="1.5" pathLength={1} className="plot-path" style={{ transitionDelay: '450ms' }} />
      {/* Vertical bus */}
      <path d="M 210 42 L 210 262" stroke={ink} strokeWidth="1.5" pathLength={1} className="plot-path" style={{ transitionDelay: '650ms' }} />

      {/* Branches + product nodes */}
      {PRODUCTS.map((name, i) => {
        const y = 42 + i * 55;
        const d = 900 + i * 140;
        return (
          <g key={name}>
            <path d={`M 210 ${y} L 262 ${y}`} stroke={ink} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: `${d}ms` }} />
            {/* arrowhead */}
            <path d={`M 256 ${y - 4} L 263 ${y} L 256 ${y + 4}`} stroke={ink} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: `${d + 80}ms` }} />
            <rect x="266" y={y - 14} width="142" height="28" stroke={ink} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: `${d + 120}ms` }} />
            <text x="278" y={y + 3.5} className="plot-label" style={{ transitionDelay: `${d + 260}ms` }} fill={ink} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.2">
              {name}
            </text>
            <circle cx="396" cy={y} r="2.5" className="plot-label" style={{ transitionDelay: `${d + 320}ms` }} fill="var(--green)" />
            <text x="218" y={y - 6} className="plot-label" style={{ transitionDelay: `${d + 200}ms` }} fill={muted} fontFamily="var(--font-mono)" fontSize="7">
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}

      {/* Dimension line under engine */}
      <path d="M 8 204 L 8 212 M 8 208 L 156 208 M 156 204 L 156 212" stroke={muted} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: '1500ms' }} />
      <text x="50" y="224" className="plot-label" style={{ transitionDelay: '1650ms' }} fill={muted} fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1">
        1 ENGINEER
      </text>

      {/* Registration crosshair, top right */}
      <path d="M 428 8 L 428 20 M 422 14 L 434 14" stroke={orange} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: '1800ms' }} />
    </svg>
  );
}
