import { ventures } from '@/lib/ventures';

const PROCESS_META: Record<string, { pid: string; cpu: string; mem: string; vsz: string; rss: string; port: string }> = {
  scoutr:     { pid: '3001', cpu: '0.8', mem: '2.1', vsz: '812340', rss: '124288', port: '3001' },
  'the-marqet': { pid: '3002', cpu: '1.4', mem: '3.7', vsz: '1048576', rss: '218112', port: '3002' },
  'the-hyve': { pid: '3003', cpu: '2.1', mem: '4.9', vsz: '1572864', rss: '312320', port: '3003' },
};

const SYSTEM_PROCS = [
  { pid: '0001', user: 'root',    cpu: '0.0', mem: '0.0', vsz: '0',      rss: '0',      stat: 'S', cmd: 'construx/kernel — runtime', accent: 'rgba(255,255,255,0.2)' },
  { pid: '0847', user: 'construx', cpu: '0.0', mem: '0.1', vsz: '24576',  rss: '4096',  stat: 'S', cmd: 'nginx: master process', accent: 'rgba(103,232,249,0.5)' },
  { pid: '1092', user: 'construx', cpu: '0.2', mem: '0.3', vsz: '65536',  rss: '12288', stat: 'S', cmd: 'redis-server 127.0.0.1:6379', accent: 'rgba(74,222,128,0.5)' },
  { pid: '2341', user: 'construx', cpu: '0.0', mem: '0.2', vsz: '32768',  rss: '8192',  stat: 'S', cmd: 'claude-api: token-router daemon', accent: 'rgba(167,139,250,0.5)' },
];

export default function VentureProcessTable() {
  const liveVentures = ventures.filter((v) => v.status === 'live');

  return (
    <div
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.96)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 3px rgba(255,95,87,0.4)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 3px rgba(255,189,46,0.3)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 3px rgba(40,200,64,0.3)' }} />
        </div>
        <span className="text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          construx@sys — ps aux — venture.process.table
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.12)' }}>
          bash — 120×40
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ps aux --construx --sort=-cpu | grep -E "venture|kernel|redis|nginx|claude"
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[9px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,4,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {['USER', 'PID', '%CPU', '%MEM', 'VSZ', 'RSS', 'STAT', 'COMMAND'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-1.5 text-left uppercase tracking-[0.12em]"
                  style={{ color: 'rgba(255,255,255,0.18)', fontWeight: 400 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SYSTEM_PROCS.map((proc, i) => (
              <tr key={proc.pid} style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                <td className="px-4 py-1.5" style={{ color: 'rgba(240,239,255,0.3)' }}>{proc.user}</td>
                <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>{proc.pid}</td>
                <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(240,239,255,0.4)' }}>{proc.cpu}</td>
                <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(240,239,255,0.4)' }}>{proc.mem}</td>
                <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(255,255,255,0.15)' }}>{proc.vsz}</td>
                <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(255,255,255,0.15)' }}>{proc.rss}</td>
                <td className="px-4 py-1.5" style={{ color: 'rgba(74,222,128,0.4)' }}>{proc.stat}</td>
                <td className="px-4 py-1.5" style={{ color: proc.accent }}>{proc.cmd}</td>
              </tr>
            ))}
            {liveVentures.map((v) => {
              const meta = PROCESS_META[v.slug] ?? { pid: '????', cpu: '0.5', mem: '1.2', vsz: '512000', rss: '98304', port: '???' };
              return (
                <tr
                  key={v.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.025)', background: `${v.accent}04` }}
                >
                  <td className="px-4 py-1.5" style={{ color: `${v.accent}88` }}>construx</td>
                  <td className="px-4 py-1.5 tabular-nums" style={{ color: `${v.accent}80` }}>{meta.pid}</td>
                  <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(249,115,22,0.7)' }}>{meta.cpu}</td>
                  <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(249,115,22,0.7)' }}>{meta.mem}</td>
                  <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>{meta.vsz}</td>
                  <td className="px-4 py-1.5 tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>{meta.rss}</td>
                  <td className="px-4 py-1.5" style={{ color: 'rgba(74,222,128,0.6)' }}>R</td>
                  <td className="px-4 py-1.5" style={{ color: v.accent }}>
                    next start — {v.slug} · port:{meta.port}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {SYSTEM_PROCS.length + liveVentures.length} processes · {liveVentures.length} ventures running
        </span>
        <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.3)' }}>construx@sys</span>
      </div>
    </div>
  );
}
