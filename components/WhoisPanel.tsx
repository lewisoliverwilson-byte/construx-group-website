'use client';

import { useState, useEffect, useRef } from 'react';

interface WhoisField {
  key: string;
  value: string;
  highlight?: boolean;
}

const WHOIS_DATA: WhoisField[] = [
  { key: 'Domain Name',            value: 'CONSTRUXGROUP.IO',                          highlight: true  },
  { key: 'Registry Domain ID',     value: 'd3dpr3doar5fjy-DONUTS',                     highlight: false },
  { key: 'Registrar WHOIS Server', value: 'whois.namecheap.com',                       highlight: false },
  { key: 'Registrar URL',          value: 'https://namecheap.com',                     highlight: false },
  { key: 'Updated Date',           value: '2026-03-01T09:14:22Z',                      highlight: false },
  { key: 'Creation Date',          value: '2026-02-28T17:30:05Z',                      highlight: true  },
  { key: 'Expiry Date',            value: '2027-02-28T17:30:05Z',                      highlight: false },
  { key: 'Registrar',              value: 'NameCheap, Inc.',                           highlight: false },
  { key: 'Registrar IANA ID',      value: '1068',                                      highlight: false },
  { key: 'Domain Status',          value: 'clientTransferProhibited https://icann.org', highlight: true  },
  { key: 'Registrant Org',         value: 'Construx Group Ltd.',                       highlight: true  },
  { key: 'Registrant Country',     value: 'GB',                                        highlight: false },
  { key: 'Name Server',            value: 'ns-1479.awsdns-56.org',                     highlight: false },
  { key: 'Name Server',            value: 'ns-198.awsdns-24.com',                      highlight: false },
  { key: 'Name Server',            value: 'ns-1782.awsdns-30.co.uk',                   highlight: false },
  { key: 'Name Server',            value: 'ns-754.awsdns-30.net',                      highlight: false },
  { key: 'DNSSEC',                 value: 'signedDelegation',                          highlight: true  },
  { key: 'Registrar Abuse Email',  value: 'abuse@namecheap.com',                       highlight: false },
  { key: 'Last Updated WHOIS',     value: '2026-06-04T07:00:00Z',                      highlight: false },
];

export default function WhoisPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > WHOIS_DATA.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 70);
    return () => clearTimeout(id);
  }, [revealed]);

  return (
    <div
      ref={ref}
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
          construx@sys — domain registry
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          {WHOIS_DATA.length} fields
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          whois construxgroup.io | grep -v "^%" | head -40
        </span>
      </div>

      {/* WHOIS output */}
      <div className="px-4 py-3 space-y-0.5">
        {WHOIS_DATA.slice(0, revealed).map((field, i) => (
          <div
            key={i}
            className="flex items-start gap-3 text-[8px] leading-relaxed"
            style={{
              opacity: 1,
              transition: 'opacity 0.1s ease',
            }}
          >
            <span
              className="flex-shrink-0"
              style={{
                color: 'rgba(255,255,255,0.22)',
                minWidth: '170px',
              }}
            >
              {field.key}:
            </span>
            <span
              style={{
                color: field.highlight
                  ? '#F97316'
                  : 'rgba(240,239,255,0.55)',
                wordBreak: 'break-all',
              }}
            >
              {field.value}
            </span>
          </div>
        ))}

        {/* Blinking cursor */}
        {revealed <= WHOIS_DATA.length && (
          <div className="text-[8px]" style={{ color: 'rgba(74,222,128,0.5)' }}>▋</div>
        )}
      </div>

      {/* DNSSEC verification badge */}
      {revealed >= WHOIS_DATA.length && (
        <div
          className="mx-4 mb-3 px-3 py-2 flex items-center gap-2 text-[8px]"
          style={{
            background: 'rgba(74,222,128,0.06)',
            border: '1px solid rgba(74,222,128,0.18)',
            borderRadius: '2px',
          }}
        >
          <span style={{ color: 'rgba(74,222,128,0.8)' }}>●</span>
          <span style={{ color: 'rgba(74,222,128,0.7)' }}>
            DNSSEC: signedDelegation — chain of trust verified
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          IANA WHOIS · .io TLD · donuts registry
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.4)' }}>
          domain active
        </span>
      </div>
    </div>
  );
}
