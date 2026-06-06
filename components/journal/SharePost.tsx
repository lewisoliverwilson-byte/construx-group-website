'use client';

import { useEffect, useState } from 'react';
import { Check, Share2 } from 'lucide-react';

interface Props {
  title: string;
  dispatchNum?: string;
}

export default function SharePost({ title, dispatchNum }: Props) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(`"${title}" — Construx Group journal`)}&url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1800);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest transition-all select-none"
        style={{
          color: open ? 'rgba(249,115,22,0.7)' : 'rgba(240,239,255,0.25)',
          background: open ? 'rgba(249,115,22,0.07)' : 'transparent',
          border: '1px solid',
          borderColor: open ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.07)',
          borderRadius: '2px',
          padding: '4px 8px',
        }}
      >
        <Share2 size={9} />
        SHARE
        {dispatchNum && (
          <span style={{ color: 'rgba(249,115,22,0.35)' }}>#{dispatchNum}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50 overflow-hidden"
          style={{
            background: 'rgba(2,2,14,0.98)',
            border: '1px solid rgba(249,115,22,0.18)',
            borderRadius: '3px',
            width: '200px',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.6)',
          }}
        >
          {/* header */}
          <div
            className="flex items-center gap-2 px-3 py-2 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF5F57' }} />
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FFBD2E' }} />
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#28C840' }} />
            <span className="font-mono text-[8px] uppercase tracking-widest ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              share.dispatch
            </span>
          </div>

          {/* URL preview */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="font-mono text-[8px] truncate" style={{ color: 'rgba(249,115,22,0.35)' }}>
              {url.replace('https://', '').slice(0, 34)}{url.length > 40 ? '…' : ''}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2.5 text-left transition-colors w-full"
              style={{ background: copied ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.0)' }}
              onMouseEnter={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(249,115,22,0.05)'; }}
              onMouseLeave={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              {copied ? (
                <Check size={10} style={{ color: '#4ade80', flexShrink: 0 }} />
              ) : (
                <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>⎘</span>
              )}
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: copied ? '#4ade80' : 'rgba(240,239,255,0.5)' }}>
                {copied ? 'COPIED' : 'COPY LINK'}
              </span>
            </button>

            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 transition-colors"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(249,115,22,0.05)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
              onClick={() => setOpen(false)}
            >
              <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>✕</span>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.5)' }}>
                POST TO X
              </span>
            </a>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
