interface Props {
  dateCounts: Record<string, number>;
}

function getWeeksOfYear(year: number) {
  const weeks: string[][] = [];
  const start = new Date(year, 0, 1);
  // align to Monday
  const dayOfWeek = start.getDay();
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(start.getDate() - offset);

  let current = new Date(start);
  while (current.getFullYear() <= year || (current.getFullYear() === year && current.getMonth() <= 11)) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10);
      week.push(dateStr);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    if (current.getFullYear() > year) break;
  }
  return weeks;
}

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

const LEVEL_OPACITY = ['0.05', '0.3', '0.55', '0.85'];

export default function DispatchCalendar({ dateCounts }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const year = new Date().getFullYear();
  const weeks = getWeeksOfYear(year);

  const totalThisYear = Object.entries(dateCounts)
    .filter(([d]) => d.startsWith(String(year)))
    .reduce((sum, [, c]) => sum + c, 0);

  return (
    <div
      className="mt-6 p-4 overflow-hidden"
      style={{
        background: 'rgba(0,0,6,0.6)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '3px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: 'rgba(249,115,22,0.5)' }}>
          // DISPATCH.CALENDAR {year}
        </span>
        <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {String(totalThisYear).padStart(3, '0')} THIS YEAR
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-0.5" style={{ minWidth: 'max-content' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((date) => {
                const count = dateCounts[date] ?? 0;
                const level = getLevel(count);
                const isFuture = date > today;
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    title={count > 0 ? `${date}: ${count} dispatch${count > 1 ? 'es' : ''}` : date}
                    className="w-2 h-2 flex-shrink-0"
                    style={{
                      borderRadius: '1px',
                      background: `rgba(249,115,22,${isFuture ? '0.02' : LEVEL_OPACITY[level]})`,
                      outline: isToday ? '1px solid rgba(249,115,22,0.5)' : 'none',
                      outlineOffset: '0px',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="font-mono text-[7px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>LESS</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className="w-2 h-2 flex-shrink-0"
            style={{ borderRadius: '1px', background: `rgba(249,115,22,${LEVEL_OPACITY[level]})` }}
          />
        ))}
        <span className="font-mono text-[7px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>MORE</span>
      </div>
    </div>
  );
}
