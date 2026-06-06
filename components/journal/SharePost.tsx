'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  title: string;
}

export default function SharePost({ title }: Props) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(`"${title}" — from the Construx Group journal`)}&url=${encodeURIComponent(url)}`;

  return (
    <a
      href={xUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-mono text-[10px] text-text-dim hover:text-text-muted transition-colors uppercase tracking-widest"
    >
      <ArrowUpRight size={11} />
      Share on X
    </a>
  );
}
