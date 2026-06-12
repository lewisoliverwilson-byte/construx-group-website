/**
 * THE MACHINE — the studio's pitch as a working drawing.
 * A continuously-running ink contraption: the Claude engine turns,
 * pistons pump, products ride the conveyor, the QA stamp presses,
 * and units dispatch. Pure CSS animation (see globals.css .machine),
 * static strokes draw in via .plot-path when an ancestor gains .in-view.
 * Hover the drawing: the whole line speeds up.
 */
export default function TheMachine({ className = '' }: { className?: string }) {
  const ink = 'var(--ink)';
  const muted = 'var(--ink-faint)';
  const mid = 'var(--ink-muted)';
  const orange = 'var(--orange)';

  return (
    <svg
      viewBox="0 0 440 392"
      fill="none"
      className={`machine ${className}`}
      aria-label="Animated schematic: the Construx machine assembling products"
      role="img"
    >
      {/* FIG label */}
      <text x="0" y="12" className="plot-label" style={{ transitionDelay: '150ms' }} fill={muted} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5">
        FIG. A — THE MACHINE · RUNS CONTINUOUSLY
      </text>
      <text x="0" y="26" className="plot-label" style={{ transitionDelay: '300ms' }} fill={muted} fontFamily="var(--font-mono)" fontSize="7" letterSpacing="1">
        (HOVER TO RUN HOT)
      </text>

      {/* ── Engine block ── */}
      <rect x="10" y="58" width="150" height="118" stroke={ink} strokeWidth="1.5" pathLength={1} className="plot-path" />
      <text x="22" y="76" className="plot-label" style={{ transitionDelay: '400ms' }} fill={ink} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.2">
        CLAUDE ENGINE
      </text>

      {/* Main gear */}
      <g className="m-gear">
        <circle cx="62" cy="128" r="30" stroke={ink} strokeWidth="1.5" pathLength={1} className="plot-path" style={{ transitionDelay: '300ms' }} />
        <path d="M 62 98 L 62 158 M 32 128 L 92 128 M 41 107 L 83 149 M 83 107 L 41 149" stroke={ink} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: '450ms' }} />
        <circle cx="62" cy="128" r="6" stroke={ink} strokeWidth="1.5" pathLength={1} className="plot-path" style={{ transitionDelay: '500ms' }} />
      </g>

      {/* Counter gear */}
      <g className="m-gear-rev">
        <circle cx="116" cy="146" r="18" stroke={mid} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: '550ms' }} />
        <path d="M 116 128 L 116 164 M 98 146 L 134 146" stroke={mid} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: '600ms' }} />
      </g>

      {/* Piston */}
      <g className="m-piston">
        <rect x="134" y="92" width="14" height="22" stroke={ink} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: '650ms' }} />
        <path d="M 141 114 L 141 132" stroke={ink} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: '700ms' }} />
      </g>

      {/* Engine output chute → belt */}
      <path d="M 160 150 L 196 150 L 196 236" stroke={ink} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: '750ms' }} />
      <path d="M 192 230 L 196 238 L 200 230" stroke={ink} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: '850ms' }} />

      {/* Engine hatching (energy) */}
      <path d="M 20 166 L 30 156 M 32 166 L 42 156 M 44 166 L 54 156" stroke={muted} strokeWidth="0.8" pathLength={1} className="plot-path" style={{ transitionDelay: '800ms' }} />

      {/* ── QA stamp assembly ── */}
      <path d="M 268 178 L 268 252 M 332 178 L 332 252 M 260 178 L 340 178" stroke={ink} strokeWidth="1.5" pathLength={1} className="plot-path" style={{ transitionDelay: '900ms' }} />
      <text x="262" y="170" className="plot-label" style={{ transitionDelay: '1000ms' }} fill={mid} fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1">
        QA STAMP
      </text>
      {/* stamp head — presses */}
      <g className="m-stamp">
        <path d="M 300 178 L 300 196" stroke={ink} strokeWidth="1.5" pathLength={1} className="plot-path" style={{ transitionDelay: '1050ms' }} />
        <rect x="282" y="196" width="36" height="22" stroke={ink} strokeWidth="1.5" fill="var(--paper)" pathLength={1} className="plot-path" style={{ transitionDelay: '1100ms' }} />
        <path d="M 292 202 L 308 212 M 308 202 L 292 212" stroke={orange} strokeWidth="2.5" pathLength={1} className="plot-path" style={{ transitionDelay: '1200ms' }} />
      </g>
      {/* impact spark */}
      <g className="m-spark">
        <path d="M 300 252 L 300 244 M 290 250 L 294 246 M 310 250 L 306 246" stroke={orange} strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* ── Conveyor ── */}
      {/* belt line (animated dashes) */}
      <path d="M 24 268 L 416 268" stroke={ink} strokeWidth="1.5" className="m-belt" />
      <path d="M 24 296 L 416 296" stroke={ink} strokeWidth="1.5" pathLength={1} className="plot-path" style={{ transitionDelay: '950ms' }} />
      {/* rollers */}
      {[48, 124, 200, 276, 352].map((x, i) => (
        <g key={x} className="m-roller">
          <circle cx={x} cy="282" r="11" stroke={ink} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: `${1000 + i * 80}ms` }} />
          <path d={`M ${x} 271 L ${x} 293`} stroke={mid} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: `${1050 + i * 80}ms` }} />
        </g>
      ))}
      {/* belt legs */}
      <path d="M 48 296 L 48 318 M 200 296 L 200 318 M 352 296 L 352 318" stroke={mid} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: '1300ms' }} />
      <path d="M 30 318 L 370 318" stroke={mid} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: '1400ms' }} />

      {/* ── Product units riding the belt ── */}
      <g className="m-box">
        <rect x="20" y="238" width="46" height="28" stroke={ink} strokeWidth="1.3" fill="var(--paper)" />
        <path d="M 30 246 L 40 256 M 40 246 L 30 256" stroke={ink} strokeWidth="2" />
        <text x="45" y="256" fill={mid} fontFamily="var(--font-mono)" fontSize="8">01</text>
      </g>
      <g className="m-box" style={{ animationDelay: 'calc(var(--mspd) / -2)' }}>
        <rect x="20" y="238" width="46" height="28" stroke={ink} strokeWidth="1.3" fill="var(--paper)" />
        <path d="M 30 246 L 40 256 M 40 246 L 30 256" stroke={ink} strokeWidth="2" />
        <text x="45" y="256" fill={mid} fontFamily="var(--font-mono)" fontSize="8">02</text>
      </g>

      {/* ── Dispatch ── */}
      <text x="372" y="250" className="plot-label" style={{ transitionDelay: '1500ms' }} fill={mid} fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1">
        DISPATCH
      </text>
      <path d="M 414 258 L 426 258 M 421 253 L 427 258 L 421 263" stroke={mid} strokeWidth="1" pathLength={1} className="plot-path" style={{ transitionDelay: '1550ms' }} />
      <circle cx="404" cy="246" r="3" fill="var(--green)" className="m-dot" />

      {/* ── Output manifest ── */}
      <text x="10" y="352" className="plot-label" style={{ transitionDelay: '1700ms' }} fill={muted} fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1">
        OUTPUT: SCOUTR · THE MARQET · THE HYVE · CONSTRUX DAILY · CONSTRUX STUDIO
      </text>
      <text x="10" y="368" className="plot-label" style={{ transitionDelay: '1850ms' }} fill={muted} fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1">
        DEFECTS SHIPPED: 0 INTENTIONALLY
      </text>

      {/* Registration crosshair */}
      <path d="M 428 40 L 428 52 M 422 46 L 434 46" stroke={orange} strokeWidth="1.2" pathLength={1} className="plot-path" style={{ transitionDelay: '2000ms' }} />
    </svg>
  );
}
