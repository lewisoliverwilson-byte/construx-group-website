interface StatRow {
  label: string;
  value: string;
  accent?: string;
}

interface Props {
  rows: StatRow[];
}

export default function JournalStats({ rows }: Props) {
  return (
    <div
      className="mt-6 font-mono text-[10px] overflow-hidden"
      style={{
        background: 'rgba(0,0,6,0.65)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '3px',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'rgba(255,95,87,0.7)' }} />
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'rgba(255,189,46,0.7)' }} />
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'rgba(40,200,64,0.7)' }} />
        <span className="ml-2 uppercase tracking-[0.2em] text-[8px]" style={{ color: 'rgba(240,239,255,0.25)' }}>
          journal.stats — construx/sys
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {rows.map(({ label, value, accent }, i) => (
          <div
            key={label}
            className="px-4 py-3 flex flex-col gap-1"
            style={{
              borderRight: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              borderBottom: i < rows.length - 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <span className="uppercase tracking-[0.18em] text-[8px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {label}
            </span>
            <span
              className="text-[13px] font-bold tabular-nums leading-none"
              style={{ color: accent ?? 'rgba(240,239,255,0.85)' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
