'use client';

import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from 'react';

interface RevealProps {
  children?: ReactNode;
  /** up = fade+rise · fade = fade only · rule = scaleX draw-in · stamp = registration-mark press */
  variant?: 'up' | 'fade' | 'rule' | 'stamp';
  /** transition-delay in ms (for staggering) */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

/**
 * Scroll-reveal wrapper. Adds `.in-view` when the element enters the viewport.
 * Respects prefers-reduced-motion (reveals instantly).
 */
export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
  style,
  as = 'div',
}: RevealProps) {
  // Cast needed: TS can't reconcile ref + children across the ElementType union
  const Tag = as as 'div';
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in-view');
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal-${variant} ${className}`}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
