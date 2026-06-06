'use client';

import { useState, useEffect, useRef } from 'react';

interface HwEntry {
  hClass:      string;
  description: string;
  product:     string;
  vendor:      string;
  width?:      string;
  capacity?:   string;
  clock?:      string;
  accent:      string;
}

const HW_ENTRIES: HwEntry[] = [
  {
    hClass: 'system',
    description: 'Computer',
    product: 'Standard PC (Q35 + ICH9, 2009)',
    vendor: 'QEMU',
    accent: 'rgba(240,239,255,0.45)',
  },
  {
    hClass: 'bus',
    description: 'Motherboard',
    product: 'Standard PC',
    vendor: 'Hetzner Online GmbH',
    accent: 'rgba(240,239,255,0.35)',
  },
  {
    hClass: 'processor',
    description: 'CPU',
    product: 'AMD EPYC 7543 32-Core Processor',
    vendor: 'Advanced Micro Devices [AMD]',
    width: '64 bits',
    clock: '3.6GHz base / 3.7GHz boost',
    accent: '#F97316',
  },
  {
    hClass: 'memory',
    description: 'System Memory',
    product: 'DDR4 ECC RAM',
    vendor: 'Hetzner',
    width: '64 bits',
    capacity: '64GiB',
    clock: '3200MHz',
    accent: '#4ade80',
  },
  {
    hClass: 'disk',
    description: 'NVMe disk',
    product: 'Samsung SSD 980 PRO 500GB',
    vendor: 'Samsung Electronics',
    capacity: '500GB',
    clock: 'PCIe 4.0 x4',
    accent: '#67e8f9',
  },
  {
    hClass: 'disk',
    description: 'NVMe disk',
    product: 'Samsung SSD 980 PRO 2TB',
    vendor: 'Samsung Electronics',
    capacity: '2TB',
    clock: 'PCIe 4.0 x4',
    accent: '#67e8f9',
  },
  {
    hClass: 'disk',
    description: 'ATA disk',
    product: 'WDC WD10SPZX-24Z10T0 1TB',
    vendor: 'Western Digital',
    capacity: '1TB',
    clock: 'SATA 6Gb/s',
    accent: '#fbbf24',
  },
  {
    hClass: 'network',
    description: 'Ethernet interface',
    product: 'Virtio 10GbE NIC',
    vendor: 'Red Hat, Inc.',
    width: '64 bits',
    capacity: '10Gbit/s',
    accent: '#a78bfa',
  },
  {
    hClass: 'network',
    description: 'Tailscale VPN',
    product: 'WireGuard virtual interface',
    vendor: 'Tailscale Inc.',
    capacity: '1Gbit/s',
    accent: '#a78bfa',
  },
];

const CLASS_LABEL: Record<string, string> = {
  system:    'SYS ',
  bus:       'BUS ',
  processor: 'CPU ',
  memory:    'MEM ',
  disk:      'DISK',
  network:   'NET ',
};

export default function LshwPanel() {
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
    if (revealed === 0 || revealed > HW_ENTRIES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 95);
    return () => clearTimeout(id);
  }, [revealed]);

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
          construx@sys — hardware info
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.2)' }}>
          hetzner cx62 · eu-west
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sudo lshw -short -sanitize 2&gt;/dev/null
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center gap-4 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '36px' }}>CLASS</span>
        <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '96px' }}>DESCRIPTION</span>
        <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>PRODUCT / DETAILS</span>
      </div>

      {/* Hardware rows */}
      <div className="px-4 py-2 space-y-1">
        {HW_ENTRIES.slice(0, revealed).map((hw, i) => (
          <div key={i} className="flex items-start gap-4 text-[8px] py-0.5">
            <span
              className="uppercase tracking-widest flex-shrink-0 tabular-nums"
              style={{ color: hw.accent + '99', minWidth: '36px' }}
            >
              {CLASS_LABEL[hw.hClass] ?? hw.hClass.slice(0, 4).toUpperCase()}
            </span>
            <span
              className="flex-shrink-0"
              style={{ color: 'rgba(240,239,255,0.3)', minWidth: '96px' }}
            >
              {hw.description}
            </span>
            <div className="flex flex-col gap-0 min-w-0">
              <span style={{ color: hw.accent }}>{hw.product}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: '7px' }}>
                {[hw.vendor, hw.capacity, hw.clock, hw.width].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {HW_ENTRIES.length} hardware entries · lshw b.02.21
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          ubuntu 24.04 lts · amd64
        </span>
      </div>
    </div>
  );
}
