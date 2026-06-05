'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, ZoomIn } from 'lucide-react';

export default function DragHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('construx-drag-hint');
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('construx-drag-hint', '1');
    }, 5000);
    return () => clearTimeout(timer);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('construx-drag-hint', '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
        >
          <button
            onClick={dismiss}
            className="flex items-center gap-3 px-5 py-2.5 font-mono text-[9px] uppercase tracking-widest text-text-muted cursor-pointer select-none hover:text-text-base transition-colors"
            style={{
              background: 'rgba(5,5,18,0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              borderRadius: '3px',
            }}
            aria-label="Dismiss hint"
          >
            <MousePointer2 size={12} className="text-construx" />
            <span>Drag</span>
            <span className="text-text-dim opacity-40">·</span>
            <ZoomIn size={12} className="text-construx" />
            <span>Zoom</span>
            <span className="text-text-dim opacity-40">·</span>
            <span>Click planet</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
