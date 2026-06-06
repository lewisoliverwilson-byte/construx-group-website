'use client';

import { useState, useEffect, useRef } from 'react';

interface RssItem {
  title:    string;
  link:     string;
  pubDate:  string;
  tag:      string;
  duration: string;
}

const CHANNEL = {
  title:       'Construx Group — Journal',
  link:        'https://construxgroup.io/journal',
  description: 'Build-in-public posts and technical dispatches from Construx Group.',
  language:    'en-gb',
  ttl:         '72',
  generator:   'Construx v1.0',
};

const ITEMS: RssItem[] = [
  { title: 'Nix: reproducible development environments',         link: '/journal/dispatch-627', pubDate: 'Thu, 06 Feb 2030 00:00:00 GMT', tag: 'Build Log', duration: '5 min' },
  { title: 'Temporal: durable workflows and reliable background jobs', link: '/journal/dispatch-626', pubDate: 'Mon, 03 Feb 2030 00:00:00 GMT', tag: 'Build Log', duration: '6 min' },
  { title: 'Drizzle ORM: type-safe SQL without the magic',       link: '/journal/dispatch-625', pubDate: 'Fri, 31 Jan 2030 00:00:00 GMT', tag: 'Build Log', duration: '5 min' },
  { title: 'Supabase: the open-source Firebase alternative',     link: '/journal/dispatch-624', pubDate: 'Tue, 28 Jan 2030 00:00:00 GMT', tag: 'Build Log', duration: '5 min' },
  { title: 'WebRTC: peer-to-peer connections in the browser',    link: '/journal/dispatch-623', pubDate: 'Sat, 25 Jan 2030 00:00:00 GMT', tag: 'Build Log', duration: '5 min' },
  { title: 'Cloudflare R2: object storage without egress fees',  link: '/journal/dispatch-622', pubDate: 'Wed, 22 Jan 2030 00:00:00 GMT', tag: 'Build Log', duration: '4 min' },
  { title: 'Server-sent events: one-way real-time from the server', link: '/journal/dispatch-621', pubDate: 'Sun, 19 Jan 2030 00:00:00 GMT', tag: 'Build Log', duration: '4 min' },
  { title: 'Deno 2: the JavaScript runtime without node_modules', link: '/journal/dispatch-620', pubDate: 'Thu, 16 Jan 2030 00:00:00 GMT', tag: 'Build Log', duration: '5 min' },
];

const HEADER_LINES = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '  <channel>',
  `    <title>${CHANNEL.title}</title>`,
  `    <link>${CHANNEL.link}</link>`,
  `    <description>${CHANNEL.description}</description>`,
  `    <language>${CHANNEL.language}</language>`,
  `    <ttl>${CHANNEL.ttl}</ttl>`,
  `    <generator>${CHANNEL.generator}</generator>`,
];

function tagColor(t: string): string {
  if (t === 'Build Log') return '#4ade80';
  if (t === 'Strategy')  return '#F97316';
  return '#a78bfa';
}

export default function RssFeedPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const TOTAL = HEADER_LINES.length + ITEMS.length + 1;

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
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed, TOTAL]);

  const allDone = revealed > TOTAL;

  const shownHeaders = allDone ? HEADER_LINES.length : Math.min(revealed, HEADER_LINES.length);
  const shownItems   = allDone ? ITEMS.length : Math.max(0, Math.min(ITEMS.length, revealed - HEADER_LINES.length));

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
          construx@sys — rss feed
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(249,115,22,0.6)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${ITEMS.length} items` : 'parsing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          curl -s https://construxgroup.io/feed.xml | xmllint --format - | head -60
        </span>
      </div>

      {/* XML content */}
      <div className="px-4 py-2">
        {/* Channel headers */}
        {HEADER_LINES.slice(0, shownHeaders).map((line, i) => (
          <div key={i} className="text-[8px] leading-snug" style={{ color: 'rgba(240,239,255,0.28)' }}>
            {line}
          </div>
        ))}

        {/* Items */}
        {ITEMS.slice(0, shownItems).map((item, i) => (
          <div key={i} className="mt-2 pl-4" style={{ borderLeft: `2px solid ${tagColor(item.tag)}22` }}>
            <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>{'    <item>'}</div>
            <div className="pl-4">
              <div className="text-[8px] text-ellipsis overflow-hidden whitespace-nowrap" style={{ color: '#F97316', maxWidth: '480px' }}>
                {'      <title>'}{item.title}{'</title>'}
              </div>
              <div className="text-[8px]" style={{ color: '#a78bfa' }}>
                {'      <link>https://construxgroup.io'}{item.link}{'</link>'}
              </div>
              <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.25)' }}>
                {'      <pubDate>'}{item.pubDate}{'</pubDate>'}
              </div>
              <div className="text-[8px]" style={{ color: tagColor(item.tag) }}>
                {'      <category>'}{item.tag}{'</category>'}
              </div>
              <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.2)' }}>
                {'      <itunes:duration>'}{item.duration}{'</itunes:duration>'}
              </div>
            </div>
            <div className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>{'    </item>'}</div>
          </div>
        ))}

        {allDone && (
          <div className="mt-1 text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>
            {'  </channel>'}
            <br />
            {'</rss>'}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          rss 2.0 · {ITEMS.length} items · ttl {CHANNEL.ttl}m · construxgroup.io/feed.xml
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(249,115,22,0.4)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● valid' : 'parsing'}
        </span>
      </div>
    </div>
  );
}
