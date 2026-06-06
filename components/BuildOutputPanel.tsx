'use client';

import { useState, useEffect, useRef } from 'react';

interface Route {
  path: string;
  size: string;
  firstLoad: string;
  type: 'static' | 'dynamic' | 'isr';
}

const ROUTES: Route[] = [
  { path: '/',                          size: '18.3 kB',  firstLoad: '105 kB',  type: 'static'  },
  { path: '/ventures',                  size: '12.1 kB',  firstLoad: '98.8 kB', type: 'static'  },
  { path: '/ventures/[venture]',        size: '9.4 kB',   firstLoad: '96.1 kB', type: 'static'  },
  { path: '/journal',                   size: '14.2 kB',  firstLoad: '101 kB',  type: 'static'  },
  { path: '/journal/[slug]',            size: '11.8 kB',  firstLoad: '98.5 kB', type: 'static'  },
  { path: '/founders',                  size: '7.2 kB',   firstLoad: '94.0 kB', type: 'static'  },
  { path: '/manifesto',                 size: '6.4 kB',   firstLoad: '93.1 kB', type: 'static'  },
  { path: '/now',                       size: '5.8 kB',   firstLoad: '92.5 kB', type: 'static'  },
  { path: '/uses',                      size: '8.9 kB',   firstLoad: '95.6 kB', type: 'static'  },
  { path: '/stats',                     size: '10.1 kB',  firstLoad: '96.8 kB', type: 'static'  },
  { path: '/contact',                   size: '6.2 kB',   firstLoad: '92.9 kB', type: 'static'  },
  { path: '/work-with-us',              size: '9.7 kB',   firstLoad: '96.4 kB', type: 'static'  },
  { path: '/api/contact',               size: '1.2 kB',   firstLoad: '—',       type: 'dynamic' },
  { path: '/api/search',                size: '0.8 kB',   firstLoad: '—',       type: 'dynamic' },
  { path: '/api/webhooks/resend',       size: '1.4 kB',   firstLoad: '—',       type: 'dynamic' },
];

const BUILD_STEPS = [
  { text: '   Creating an optimized production build...', delay: 0, color: 'rgba(240,239,255,0.45)' },
  { text: ' ✓ Compiled successfully', delay: 600, color: 'rgba(74,222,128,0.85)' },
  { text: ' ✓ Linting and checking validity of types', delay: 900, color: 'rgba(74,222,128,0.85)' },
  { text: ' ✓ Collecting page data', delay: 1200, color: 'rgba(74,222,128,0.85)' },
  { text: ' ✓ Generating static pages (47/47)', delay: 1600, color: 'rgba(74,222,128,0.85)' },
  { text: ' ✓ Finalizing page optimization', delay: 1900, color: 'rgba(74,222,128,0.85)' },
];

const TYPE_CONFIG = {
  static:  { symbol: '○', color: 'rgba(240,239,255,0.5)', label: 'Static' },
  dynamic: { symbol: 'λ', color: 'rgba(103,232,249,0.7)', label: 'Dynamic' },
  isr:     { symbol: '◑', color: 'rgba(168,85,247,0.7)',  label: 'ISR' },
};

export default function BuildOutputPanel() {
  const [step, setStep] = useState(0);
  const [showRoutes, setShowRoutes] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setVisible(true);
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    BUILD_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => setStep(i + 1), s.delay));
    });
    timers.push(setTimeout(() => setShowRoutes(true), 2300));
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const done = step >= BUILD_STEPS.length;

  return (
    <div ref={ref}>
      <div
        className="overflow-hidden font-mono"
        style={{
          background: 'rgba(1,1,10,0.97)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '3px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
            construx@sys — next build — production
          </span>
          <span className="text-[8px] uppercase tracking-widest" style={{ color: done ? 'rgba(74,222,128,0.6)' : 'rgba(249,115,22,0.6)' }}>
            {done ? 'BUILD OK' : 'BUILDING'}
          </span>
        </div>

        {/* Shell prompt */}
        <div
          className="px-4 py-1.5 select-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
          <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
            npm run build 2&gt;&amp;1 | tee /var/log/construx/build.log
          </span>
        </div>

        {/* Build steps */}
        <div className="px-4 pt-3 pb-2 space-y-0.5 text-[11px]">
          {BUILD_STEPS.slice(0, step).map((s, i) => (
            <div key={i} style={{ color: s.color }}>{s.text}</div>
          ))}
          {!done && (
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-block w-3 h-3 border-2 border-t-transparent rounded-full"
                style={{ borderColor: 'rgba(249,115,22,0.6)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
              />
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: '10px' }}>compiling...</span>
            </div>
          )}
        </div>

        {/* Route table */}
        {showRoutes && (
          <>
            <div
              className="px-4 pt-3 pb-1 text-[10px]"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div style={{ color: 'rgba(240,239,255,0.3)', marginBottom: '8px' }}>
                Route (app){'                           '}Size{'     '}First Load JS
              </div>

              {/* Shared chunk */}
              <div style={{ color: 'rgba(240,239,255,0.2)', marginBottom: '4px' }}>
                {'┌'} shared by all{'                      '}86.7 kB
              </div>

              {ROUTES.map((route, i) => {
                const cfg = TYPE_CONFIG[route.type];
                const isLast = i === ROUTES.length - 1;
                const prefix = isLast ? '└' : i === 0 ? '├' : '├';
                return (
                  <div
                    key={route.path}
                    className="flex items-baseline gap-0 leading-[1.7]"
                  >
                    <span style={{ color: 'rgba(240,239,255,0.15)' }}>{prefix} </span>
                    <span style={{ color: cfg.color, marginRight: '4px' }}>{cfg.symbol} </span>
                    <span
                      className="flex-1"
                      style={{ color: 'rgba(240,239,255,0.65)' }}
                    >
                      {route.path.padEnd(38)}
                    </span>
                    <span
                      className="tabular-nums"
                      style={{ color: 'rgba(240,239,255,0.4)', minWidth: '60px', textAlign: 'right' }}
                    >
                      {route.size}
                    </span>
                    <span
                      className="tabular-nums"
                      style={{ color: route.type === 'static' ? 'rgba(74,222,128,0.6)' : 'rgba(103,232,249,0.6)', minWidth: '68px', textAlign: 'right' }}
                    >
                      {route.type !== 'dynamic' ? ` ${route.firstLoad}` : '   —'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div
              className="flex items-center gap-6 px-4 py-2 text-[9px]"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.25)' }}
            >
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <span key={key}>
                  <span style={{ color: cfg.color }}>{cfg.symbol} </span>
                  {cfg.label}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Status footer */}
        <div
          className="flex items-center justify-between px-4 py-1.5 select-none"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
        >
          <span className="text-[8px] uppercase tracking-widest" style={{ color: done ? 'rgba(74,222,128,0.5)' : 'rgba(249,115,22,0.5)' }}>
            {done ? `${ROUTES.length} routes · 47 pages · 2.84s` : 'building...'}
          </span>
          <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.3)' }}>Next.js 15.3.3</span>
        </div>
      </div>
    </div>
  );
}
