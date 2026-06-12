'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center pt-32 pb-20">
      <div className="mx-auto w-full max-w-4xl px-6 lg:px-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="reg-mark" />
          <p className="t-eyebrow">Runtime error</p>
        </div>

        <h1 className="t-hero mb-8" style={{ fontSize: 'clamp(2.6rem,6vw,5rem)' }}>
          Something broke.
          <br />
          We&apos;re on it.
        </h1>

        <div className="title-rule mb-8" style={{ maxWidth: 320 }} />

        <p className="t-lead mb-4" style={{ maxWidth: '44ch' }}>
          An unexpected error occurred while rendering this page. Try again — if it
          persists, it&apos;s our fault, not yours.
        </p>

        {error.digest && (
          <p className="t-meta mb-12">Reference: {error.digest}</p>
        )}

        <div className="flex flex-wrap items-center gap-5 mt-8">
          <button onClick={reset} className="btn-ink" style={{ cursor: 'pointer' }}>
            <RefreshCw size={12} /> Try again
          </button>
          <Link href="/" className="btn-text">
            <ArrowLeft size={11} /> Back to the studio
          </Link>
        </div>
      </div>
    </div>
  );
}
