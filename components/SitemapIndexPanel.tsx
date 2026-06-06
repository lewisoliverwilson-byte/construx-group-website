'use client';

import { useState, useEffect, useRef } from 'react';

interface UrlEntry {
  slug:       string;
  lastmod:    string;
  changefreq: string;
  priority:   string;
}

const BASE_ENTRIES: UrlEntry[] = [
  { slug: 'dispatch-627', lastmod: '2030-02-06', changefreq: 'weekly', priority: '0.9' },
  { slug: 'dispatch-626', lastmod: '2030-02-03', changefreq: 'weekly', priority: '0.9' },
  { slug: 'dispatch-625', lastmod: '2030-01-31', changefreq: 'weekly', priority: '0.9' },
  { slug: 'dispatch-624', lastmod: '2030-01-28', changefreq: 'weekly', priority: '0.8' },
  { slug: 'dispatch-623', lastmod: '2030-01-25', changefreq: 'weekly', priority: '0.8' },
  { slug: 'dispatch-622', lastmod: '2030-01-22', changefreq: 'weekly', priority: '0.8' },
  { slug: 'dispatch-621', lastmod: '2030-01-19', changefreq: 'weekly', priority: '0.8' },
  { slug: 'dispatch-620', lastmod: '2030-01-16', changefreq: 'weekly', priority: '0.8' },
  { slug: 'dispatch-619', lastmod: '2030-01-13', changefreq: 'weekly', priority: '0.7' },
  { slug: 'dispatch-618', lastmod: '2030-01-10', changefreq: 'weekly', priority: '0.7' },
  { slug: 'dispatch-617', lastmod: '2030-01-07', changefreq: 'weekly', priority: '0.7' },
  { slug: 'dispatch-616', lastmod: '2030-01-04', changefreq: 'weekly', priority: '0.7' },
  { slug: 'dispatch-615', lastmod: '2030-01-01', changefreq: 'weekly', priority: '0.7' },
  { slug: 'dispatch-614', lastmod: '2029-12-29', changefreq: 'weekly', priority: '0.7' },
  { slug: 'dispatch-613', lastmod: '2029-12-26', changefreq: 'weekly', priority: '0.6' },
];

function priorityColor(p: string) {
  const n = parseFloat(p);
  if (n >= 0.9) return '#4ade80';
  if (n >= 0.8) return '#a78bfa';
  if (n >= 0.7) return '#67e8f9';
  return 'rgba(240,239,255,0.3)';
}

export default function SitemapIndexPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE_ENTRIES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > BASE_ENTRIES.length;
  const displayed = BASE_ENTRIES.slice(0, allDone ? BASE_ENTRIES.length : revealed);

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
          construx@sys — sitemap.xml
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${BASE_ENTRIES.length} urls` : 'parsing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          curl -s https://construxgroup.io/sitemap.xml | xmllint --format -
        </span>
      </div>

      {/* XML header */}
      <div className="px-4 pt-2 pb-1">
        <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>
          {'<?xml version="1.0" encoding="UTF-8"?>'}
        </span>
        <br />
        <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>
          {'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'}
        </span>
      </div>

      {/* Entries */}
      <div className="px-4 pb-2 space-y-2">
        {displayed.map((e, i) => (
          <div key={i} className="pl-2" style={{ borderLeft: `2px solid ${priorityColor(e.priority)}22` }}>
            <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>&lt;url&gt;</div>
            <div className="pl-3 space-y-0.5">
              <div className="text-[8px] flex gap-2">
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '72px' }}>&lt;loc&gt;</span>
                <span style={{ color: '#a78bfa' }}>
                  https://construxgroup.io/journal/{e.slug}
                </span>
              </div>
              <div className="text-[8px] flex gap-2">
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '72px' }}>&lt;lastmod&gt;</span>
                <span style={{ color: 'rgba(240,239,255,0.45)' }}>{e.lastmod}</span>
              </div>
              <div className="text-[8px] flex gap-2">
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '72px' }}>&lt;changefreq&gt;</span>
                <span style={{ color: '#67e8f9' }}>{e.changefreq}</span>
              </div>
              <div className="text-[8px] flex gap-2">
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '72px' }}>&lt;priority&gt;</span>
                <span style={{ color: priorityColor(e.priority), fontWeight: 700 }}>{e.priority}</span>
              </div>
            </div>
            <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>&lt;/url&gt;</div>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>
            {'</urlset>'}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          sitemap.xml · {BASE_ENTRIES.length} journal urls · changefreq weekly
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● valid' : 'parsing'}
        </span>
      </div>
    </div>
  );
}
