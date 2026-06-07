'use client';

import { useEffect, useRef, useState } from 'react';

const FRAMEWORKS = [
  { name: 'NSA', full: 'NSA-CISA Hardening', pass: 41, fail: 7, score: 85 },
  { name: 'MITRE', full: 'MITRE ATT&CK', pass: 29, fail: 4, score: 88 },
  { name: 'CIS', full: 'CIS Kubernetes', pass: 58, fail: 9, score: 87 },
  { name: 'SOC2', full: 'SOC 2 Type II', pass: 22, fail: 3, score: 88 },
];

const CONTROLS = [
  { id: 'C-0001', name: 'Forbidden container registries', status: 'PASS', sev: 'HIGH', resources: 31 },
  { id: 'C-0009', name: 'Resource limits not set', status: 'FAIL', sev: 'MED', resources: 4 },
  { id: 'C-0016', name: 'Allow privilege escalation', status: 'PASS', sev: 'HIGH', resources: 31 },
  { id: 'C-0017', name: 'Immutable container FS', status: 'FAIL', sev: 'LOW', resources: 6 },
  { id: 'C-0034', name: 'AppArmor profile configured', status: 'PASS', sev: 'MED', resources: 31 },
  { id: 'C-0044', name: 'Container hostNetwork', status: 'PASS', sev: 'HIGH', resources: 31 },
  { id: 'C-0055', name: 'Linux hardcoded capabilities', status: 'FAIL', sev: 'HIGH', resources: 2 },
  { id: 'C-0067', name: 'Request CPU limit', status: 'PASS', sev: 'MED', resources: 27 },
];

const STATUS_COLOR: Record<string, string> = { PASS: '#4ade80', FAIL: '#f87171', WARN: '#fbbf24' };
const SEV_COLOR: Record<string, string> = { HIGH: '#f87171', MED: '#fbbf24', LOW: '#67e8f9' };

function ScoreBar({ score }: { score: number }) {
  return (
    <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${score}%`,
          background: score >= 85 ? '#4ade80' : score >= 70 ? '#fbbf24' : '#f87171',
          borderRadius: 2,
          transition: 'width 1.2s ease',
        }}
      />
    </div>
  );
}

export default function KubescapePanel() {
  const [visible, setVisible] = useState(false);
  const [rows, setRows] = useState(0);
  const [fwRows, setFwRows] = useState(0);
  const [scanPct, setScanPct] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setScanPct((p) => {
        if (p >= 100) { clearInterval(timer); return 100; }
        return p + 3;
      });
    }, 60);
    const rowTimer = setInterval(() => setRows((r) => Math.min(r + 1, CONTROLS.length)), 140);
    const fwTimer = setInterval(() => setFwRows((r) => Math.min(r + 1, FRAMEWORKS.length)), 200);
    return () => { clearInterval(timer); clearInterval(rowTimer); clearInterval(fwTimer); };
  }, [visible]);

  const passCount = CONTROLS.filter((c) => c.status === 'PASS').length;
  const failCount = CONTROLS.filter((c) => c.status === 'FAIL').length;
  const overallScore = Math.round((passCount / CONTROLS.length) * 100);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(74,222,128,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(74,222,128,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(74,222,128,0.08)', background: 'rgba(74,222,128,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)' }}>
          kubescape -- kubernetes security posture
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          score {overallScore}%
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>ksec@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubescape scan framework nsa,mitre,cis --enable-host-scan --format=pretty-printer</span>
      </div>

      {/* Scan progress */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,4,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>scanning cluster resources</span>
          <span className="tabular-nums" style={{ fontSize: 8, color: scanPct < 100 ? '#fbbf24' : '#4ade80' }}>{scanPct}%</span>
        </div>
        <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${scanPct}%`,
              background: 'linear-gradient(90deg, #4ade80, #67e8f9)',
              borderRadius: 2,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* Framework table */}
      <div style={{ padding: '10px 14px 0' }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // framework compliance
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {FRAMEWORKS.slice(0, fwRows).map((fw) => (
            <div key={fw.name} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 60px 60px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontWeight: 700, fontSize: 9 }}>{fw.name}</span>
              <span style={{ fontSize: 8, color: 'rgba(240,239,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fw.full}</span>
              <span className="tabular-nums" style={{ fontSize: 8, color: '#4ade80', textAlign: 'right' }}>{fw.pass} pass</span>
              <span className="tabular-nums" style={{ fontSize: 8, color: '#f87171', textAlign: 'right' }}>{fw.fail} fail</span>
              <div style={{ width: '100%' }}>
                <ScoreBar score={fw.score} />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // control results
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CONTROLS.slice(0, rows).map((ctrl) => (
            <div key={ctrl.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 44px 36px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ctrl.status === 'FAIL' ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.03)', border: `1px solid ${STATUS_COLOR[ctrl.status]}18`, borderRadius: 2, fontSize: 9 }}>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8 }}>{ctrl.id}</span>
              <span style={{ color: 'rgba(240,239,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ctrl.name}</span>
              <span style={{ color: STATUS_COLOR[ctrl.status], fontWeight: 700, fontSize: 8, textAlign: 'center', padding: '1px 4px', background: `${STATUS_COLOR[ctrl.status]}14`, borderRadius: 2, border: `1px solid ${STATUS_COLOR[ctrl.status]}28` }}>{ctrl.status}</span>
              <span style={{ color: SEV_COLOR[ctrl.sev], fontSize: 8, textAlign: 'center' }}>{ctrl.sev}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8, textAlign: 'right' }}>{ctrl.resources}r</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kubescape v3.0.3 - armo - kspm
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {passCount} passed - {failCount} failed - {CONTROLS.length} controls
        </span>
      </div>
    </div>
  );
}
