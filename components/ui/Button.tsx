import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

type BaseProps = {
  variant?: 'primary' | 'outline' | 'ghost' | 'venture';
  size?: 'sm' | 'md' | 'lg';
  venturAccent?: string;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never; external?: never };

type LinkProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean };

type Props = ButtonProps | LinkProps;

const base =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-construx focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:opacity-40 disabled:pointer-events-none select-none whitespace-nowrap';

const variants = {
  primary:
    'bg-construx text-black hover:bg-orange-400 active:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]',
  outline:
    'border border-border-bright text-text-base hover:border-construx hover:text-construx hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] bg-transparent',
  ghost: 'text-text-muted hover:text-text-base bg-transparent',
  venture: 'text-black font-semibold',
};

const sizes = {
  sm: 'font-mono text-xs px-4 py-2 uppercase tracking-wider',
  md: 'font-mono text-xs px-5 py-2.5 uppercase tracking-wider',
  lg: 'font-mono text-sm px-7 py-3.5 uppercase tracking-wider',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  venturAccent,
  className,
  children,
  ...props
}: Props) {
  const styles = cn(base, variants[variant], sizes[size], className);
  const inlineStyle =
    variant === 'venture' && venturAccent
      ? { backgroundColor: venturAccent, boxShadow: `0 0 20px ${venturAccent}44` }
      : undefined;

  if ('href' in props && props.href) {
    const { href, external, ...rest } = props as LinkProps;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={styles} style={inlineStyle} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={styles} style={inlineStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} style={inlineStyle} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
