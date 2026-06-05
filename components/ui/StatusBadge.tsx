import { cn } from '@/lib/utils';
import type { VentureStatus } from '@/lib/ventures';

const config: Record<VentureStatus, { label: string; class: string; dot: string }> = {
  live: {
    label: 'Live',
    class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  'coming-soon': {
    label: 'Coming Soon',
    class: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  incubation: {
    label: 'In Incubation',
    class: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dot: 'bg-purple-400',
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
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        cls,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot, status === 'live' && 'animate-pulse')} />
      {label}
    </span>
  );
}
