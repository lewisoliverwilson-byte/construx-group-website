'use client';

import { useState, useEffect, useRef } from 'react';

interface DnsRecord {
  name:    string;
  ttl:     number;
  cls:     string;
  type:    string;
  value:   string;
  accent:  string;
}

const BASE_RECORDS: DnsRecord[] = [
  { name: 'construxgroup.io.',  ttl: 299,  cls: 'IN', type: 'A',    value: '76.223.108.40',                        accent: '#F97316' },
  { name: 'construxgroup.io.',  ttl: 299,  cls: 'IN', type: 'A',    value: '99.83.190.102',                        accent: '#F97316' },
  { name: 'construxgroup.io.',  ttl: 3599, cls: 'IN', type: 'AAAA', value: '2600:9000:a61e:d28::1',                accent: '#67e8f9' },
  { name: 'construxgroup.io.',  ttl: 3599, cls: 'IN', type: 'NS',   value: 'ns-1536.awsdns-00.co.uk.',             accent: '#a78bfa' },
  { name: 'construxgroup.io.',  ttl: 3599, cls: 'IN', type: 'NS',   value: 'ns-820.awsdns-38.net.',                accent: '#a78bfa' },
  { name: 'construxgroup.io.',  ttl: 3599, cls: 'IN', type: 'MX',   value: '10 inbound-smtp.eu-west-1.amazonaws.com.', accent: '#4ade80' },
  { name: 'construxgroup.io.',  ttl: 299,  cls: 'IN', type: 'TXT',  value: '"v=spf1 include:amazonses.com ~all"',  accent: '#fbbf24' },
  { name: 'construxgroup.io.',  ttl: 299,  cls: 'IN', type: 'TXT',  value: '"v=DMARC1; p=quarantine; rua=mailto:dmarc@construxgroup.io"', accent: '#fbbf24' },
  { name: '_dmarc.construxgroup.io.', ttl: 299, cls: 'IN', type: 'TXT', value: '"v=DMARC1; p=reject; adkim=s"',   accent: '#fbbf24' },
  { name: 'construxgroup.io.',  ttl: 21599,cls: 'IN', type: 'SOA',  value: 'ns-1536.awsdns-00.co.uk. hostmaster.awsdns.com. 1 7200 900 1209600 86400', accent: 'rgba(240,239,255,0.25)' },
];

function typeColor(type: string): string {
  switch (type) {
    case 'A':    return '#F97316';
    case 'AAAA': return '#67e8f9';
    case 'NS':   return '#a78bfa';
    case 'MX':   return '#4ade80';
    case 'TXT':  return '#fbbf24';
    case 'SOA':  return 'rgba(240,239,255,0.25)';
    default:     return 'rgba(240,239,255,0.45)';
  }
}

function fmtTtl(ttl: number): string {
  if (ttl >= 3600) return Math.floor(ttl / 3600) + 'h';
  if (ttl >= 60)   return Math.floor(ttl / 60)   + 'm';
  return ttl + 's';
}

export default function DnsLookupPanel() {
  const [revealed, setRevealed]     = useState(0);
  const [records,  setRecords]      = useState<DnsRecord[]>(BASE_RECORDS);
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
    if (revealed === 0 || revealed > BASE_RECORDS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 90);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setRecords((prev) =>
        prev.map((r) => ({
          ...r,
          ttl: Math.max(1, r.ttl - 1),
        })),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const aRecords    = records.filter((r) => r.type === 'A').length;
  const queryTime   = 18;
  const serverIp    = '8.8.8.8';

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
          construx@sys — dns lookup
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {aRecords} A · @{serverIp}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          dig construxgroup.io ANY +noall +answer +authority @{serverIp}
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'NAME',  width: '208px' },
          { label: 'TTL',   width: '52px'  },
          { label: 'CLASS', width: '48px'  },
          { label: 'TYPE',  width: '52px'  },
          { label: 'VALUE', width: 'auto'  },
        ].map((col) => (
          <span
            key={col.label}
            className="text-[8px] uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.2)', minWidth: col.width, flexShrink: 0 }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* DNS record rows */}
      <div className="px-4 py-2 space-y-1">
        {records.slice(0, revealed).map((r, i) => {
          const tc = typeColor(r.type);
          return (
            <div key={i} className="flex items-start text-[8px] tabular-nums gap-0">
              <span
                className="truncate flex-shrink-0"
                style={{ color: 'rgba(240,239,255,0.35)', minWidth: '208px' }}
              >
                {r.name}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '52px', flexShrink: 0 }}>
                {fmtTtl(r.ttl)}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '48px', flexShrink: 0 }}>
                {r.cls}
              </span>
              <span
                className="font-bold"
                style={{ color: tc, minWidth: '52px', flexShrink: 0 }}
              >
                {r.type}
              </span>
              <span
                className="flex-1 break-all leading-relaxed"
                style={{ color: r.accent }}
              >
                {r.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {BASE_RECORDS.length} records · {queryTime}ms · via {serverIp}#53
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          ttl live
        </span>
      </div>
    </div>
  );
}
