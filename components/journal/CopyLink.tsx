'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

export default function CopyLink() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silently ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-[9px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest px-2.5 py-1.5"
      style={{
        background: copied ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${copied ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '2px',
        color: copied ? '#F97316' : undefined,
      }}
      aria-label="Copy link to this post"
    >
      {copied ? (
        <>
          <Check size={10} />
          COPIED
        </>
      ) : (
        <>
          <Link2 size={10} />
          COPY LINK
        </>
      )}
    </button>
  );
}
