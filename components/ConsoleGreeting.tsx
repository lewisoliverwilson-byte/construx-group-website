'use client';

import { useEffect } from 'react';

interface Props {
  postCount: number;
}

export default function ConsoleGreeting({ postCount }: Props) {
  useEffect(() => {
    console.log(
      '%cCONSTRUX GROUP',
      'color: #F97316; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 0.15em;'
    );
    console.log(
      `%cAI-First Ventures\n\nBuilding at the frontier of what AI makes possible.\n3 live ventures · ${postCount} dispatches · 2 founders`,
      'color: rgba(240,239,255,0.6); font-family: monospace; font-size: 11px; line-height: 1.7;'
    );
    console.log(
      '%cCurious how this was built?\nhttps://construxgroup.io/journal/building-this-website',
      'color: #F97316; font-family: monospace; font-size: 11px;'
    );
    console.log(
      '%cPress ? for keyboard shortcuts. g+j, g+v, g+m to navigate.',
      'color: rgba(240,239,255,0.3); font-family: monospace; font-size: 10px;'
    );
  }, []);

  return null;
}
