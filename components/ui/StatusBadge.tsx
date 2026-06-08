import { cn } from '@/lib/utils';
import type { VentureStatus } from '@/lib/ventures';

const config: Record<VentureStatus, { label: string; class: string; dot: string }> = {
  live: {
    label: 'Live',
    class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  dev: {
    label: 'In Development',
    class: 'bg-white/5 text-white/35 border-white/10',
    dot: 'bg-white/30',
  },
};

export default function StatusBadge({
  status,
  className,
}: {
  status: VentureStatus;
  className?: string;
}) {
  const { label, class: cls, dot } = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest',
        cls,
        className
      )}
      style={{ borderRadius: '2px' }}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot, status === 'live' && 'animate-pulse')} />
      {label}
    </span>
  );
}
