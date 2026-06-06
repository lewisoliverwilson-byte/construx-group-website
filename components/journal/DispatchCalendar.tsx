interface Props {
  dateCounts: Record<string, number>;
}

function getWeeksOfYear(year: number) {
  const weeks: string[][] = [];
  const start = new Date(year, 0, 1);
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

const LEVEL_OPACITY = ['0.05', '0.30', '0.55', '0.88'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DispatchCalendar({ dateCounts }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const year = new Date().getFullYear();
  const weeks = getWeeksOfYear(year);

  const totalThisYear = Object.entries(dateCounts)
    .filter(([d]) => d.startsWith(String(year)))
    .reduce((sum, [, c]) => sum + c, 0);

  const activeDays = Object.entries(dateCounts)
    .filter(([d]) => d.startsWith(String(year)) && dateCounts[d] > 0)
    .length;

  const currentStreak = (() => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      if ((dateCounts[ds] ?? 0) === 0) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  })();

  // Build month label positions: find the first week that starts in each month
  const monthPositions: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDayOfWeek = new Date(week[0]);
    const m = firstDayOfWeek.getMonth();
    if (m !== lastMonth && firstDayOfWeek.getFullYear() === year) {
      monthPositions.push({ month: MONTH_LABELS[m], weekIndex: wi });
      lastMonth = m;
    }
  });

  return (
    <div
      className="mt-6 overflow-hidden"
      style={{
        background: 'rgba(0,0,6,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '4px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* macOS title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 3px rgba(255,95,87,0.35)' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 3px rgba(255,189,46,0.3)' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 3px rgba(40,200,64,0.3)' }} />
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: 'rgba(255,255,255,0.18)' }}>
          dispatch.calendar — {year}
        </span>
        <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {String(totalThisYear).padStart(3, '0')} dispatches
        </span>
      </div>

      <div className="px-4 pt-3 pb-4">
        {/* Month labels */}
        <div
          className="flex mb-1 overflow-x-auto"
          style={{ paddingLeft: '20px' }}
        >
          <div className="relative flex-1" style={{ minWidth: 'max-content' }}>
            {monthPositions.map(({ month, weekIndex }) => (
              <span
                key={month}
                className="absolute font-mono text-[7px] uppercase tracking-widest select-none"
                style={{
                  left: `${weekIndex * 10}px`,
                  color: 'rgba(255,255,255,0.2)',
                }}
              >
                {month}
              </span>
            ))}
            {/* spacer so the month labels have height */}
            <div style={{ height: '11px' }} />
          </div>
        </div>

        {/* Calendar grid with day labels */}
        <div className="flex gap-1.5 overflow-x-auto">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 justify-start pt-0 flex-shrink-0" style={{ paddingTop: '0px' }}>
            {['M', '', 'W', '', 'F', '', ''].map((d, i) => (
              <div
                key={i}
                className="font-mono text-[6px] leading-none flex items-center justify-center"
                style={{ width: '8px', height: '8px', color: 'rgba(255,255,255,0.18)' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Week columns */}
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
                        borderRadius: '1.5px',
                        background: isFuture
                          ? 'rgba(255,255,255,0.02)'
                          : `rgba(249,115,22,${LEVEL_OPACITY[level]})`,
                        outline: isToday ? '1.5px solid rgba(249,115,22,0.6)' : 'none',
                        outlineOffset: '1px',
                        boxShadow: level === 3 && !isFuture
                          ? '0 0 3px rgba(249,115,22,0.3)'
                          : 'none',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend + stats footer */}
        <div className="flex items-center justify-between mt-3 gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[7px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.18)' }}>LESS</span>
            {[0, 1, 2, 3].map((level) => (
              <div
                key={level}
                className="w-2 h-2 flex-shrink-0"
                style={{
                  borderRadius: '1.5px',
                  background: `rgba(249,115,22,${LEVEL_OPACITY[level]})`,
                  boxShadow: level === 3 ? '0 0 3px rgba(249,115,22,0.3)' : 'none',
                }}
              />
            ))}
            <span className="font-mono text-[7px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.18)' }}>MORE</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <span style={{ color: 'rgba(249,115,22,0.45)' }}>{activeDays}</span> active days
            </span>
            {currentStreak > 0 && (
              <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <span style={{ color: 'rgba(249,115,22,0.45)' }}>{currentStreak}</span>d streak
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
