'use client';

import { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const code = preRef.current?.querySelector('code')?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="relative group">
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        style={{
          background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.12)',
          border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(249,115,22,0.2)',
          borderRadius: '2px',
          padding: '3px 8px',
        }}
      >
        {copied ? (
          <>
            <Check size={10} style={{ color: '#86efac' }} />
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#86efac' }}>
              COPIED
            </span>
          </>
        ) : (
          <>
            <Copy size={10} style={{ color: 'rgba(249,115,22,0.6)' }} />
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.6)' }}>
              COPY
            </span>
          </>
        )}
      </button>
    </div>
  );
}
