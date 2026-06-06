'use client';

import { useState, useRef, Children, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

function detectLang(className?: string): string {
  if (!className) return '';
  const m = className.match(/language-(\w+)/);
  if (!m) return '';
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript/JSX', js: 'JavaScript', jsx: 'JavaScript/JSX',
    python: 'Python', py: 'Python', sql: 'SQL', sh: 'Shell', bash: 'Shell',
    css: 'CSS', json: 'JSON', yaml: 'YAML', yml: 'YAML', html: 'HTML',
    rust: 'Rust', go: 'Go', java: 'Java', markdown: 'Markdown', md: 'Markdown',
    typescript: 'TypeScript', javascript: 'JavaScript',
  };
  return map[m[1].toLowerCase()] ?? m[1].toUpperCase();
}

function getChildClassName(children: React.ReactNode): string | undefined {
  const arr = Children.toArray(children);
  for (const child of arr) {
    if (child && typeof child === 'object' && 'props' in child) {
      const props = (child as React.ReactElement<{ className?: string }>).props;
      if (props.className) return props.className;
    }
  }
  return undefined;
}

export default function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const [lineCount, setLineCount] = useState<number | null>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const text = preRef.current?.querySelector('code')?.textContent ?? '';
    const lines = text.split('\n').filter((l) => l.trim() !== '').length;
    if (lines > 0) setLineCount(lines);
  }, []);

  const handleCopy = async () => {
    const text = preRef.current?.querySelector('code')?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const langClass = getChildClassName(children);
  const lang = detectLang(langClass);

  return (
    <div
      className="relative my-6 overflow-hidden"
      style={{
        background: 'rgba(0,0,8,0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '6px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 3px rgba(255,95,87,0.4)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 3px rgba(255,189,46,0.3)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 3px rgba(40,200,64,0.3)' }} />
        </div>
        {lang && (
          <span
            className="font-mono text-[9px] uppercase tracking-widest flex-1 text-center"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            {lang}
          </span>
        )}
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          className="flex items-center gap-1 transition-all ml-auto"
          style={{
            background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.1)',
            border: copied ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(249,115,22,0.18)',
            borderRadius: '2px',
            padding: '2px 7px',
          }}
        >
          {copied ? (
            <>
              <Check size={9} style={{ color: '#86efac' }} />
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: '#86efac' }}>COPIED</span>
            </>
          ) : (
            <>
              <Copy size={9} style={{ color: 'rgba(249,115,22,0.55)' }} />
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.55)' }}>COPY</span>
            </>
          )}
        </button>
      </div>

      {/* Shell prompt */}
      <div className="px-4 py-1.5 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
        <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
        <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{lang ? `cat --syntax=${lang.toLowerCase()}` : 'cat snippet'}</span>
      </div>
      {/* Code area */}
      <pre
        ref={preRef}
        {...props}
        style={{
          margin: 0,
          borderRadius: 0,
          background: 'transparent',
          ...props.style,
        }}
      >
        {children}
      </pre>

      {/* Footer bar */}
      <div
        className="flex items-center gap-4 px-4 py-1.5 select-none"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.14)' }}>
          construx/construx-group-website
        </span>
        <div className="flex items-center gap-3 ml-auto">
          {lineCount !== null && (
            <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.14)' }}>
              {lineCount} lines
            </span>
          )}
          <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.14)' }}>
            {lang || 'code'}
          </span>
        </div>
      </div>
    </div>
  );
}
