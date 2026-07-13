"use client";

import { useEffect, useState } from "react";
import { useLinkStatus } from "next/link";

/**
 * Instant press feedback + delayed loading overlay while navigating to a PDP.
 * Spinner waits ~400ms to avoid flicker on fast navigations (UX loading timing).
 */
export function ProductCardPending() {
  const { pending } = useLinkStatus();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!pending) {
      setShowOverlay(false);
      return;
    }
    const timer = window.setTimeout(() => setShowOverlay(true), 400);
    return () => window.clearTimeout(timer);
  }, [pending]);

  if (!pending) return null;

  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 z-[1] bg-[var(--ink)]/10 transition-opacity motion-reduce:transition-none"
        aria-hidden
      />
      {showOverlay ? (
        <span
          className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-[var(--surface)]/75 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
        >
          <span
            className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-r-transparent motion-reduce:animate-none"
            aria-hidden
          />
          <span className="text-xs font-medium tracking-wide text-[var(--ink)]">Opening piece…</span>
        </span>
      ) : (
        <span className="sr-only" role="status" aria-live="polite">
          Opening piece…
        </span>
      )}
    </>
  );
}
