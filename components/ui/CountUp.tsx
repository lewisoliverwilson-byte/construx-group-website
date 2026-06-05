'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  pad?: number;
}

export default function CountUp({ to, duration = 1400, prefix = '', suffix = '', pad = 0 }: Props) {
  const [val, setVal] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const ease = 1 - Math.pow(1 - t, 3);
            setVal(Math.round(ease * to));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  const display = pad > 0 ? String(val).padStart(pad, '0') : String(val);

  return (
    <span ref={spanRef} className="tabular-nums">
      {prefix}{display}{suffix}
    </span>
  );
}
