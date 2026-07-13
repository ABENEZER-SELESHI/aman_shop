"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top bar during route transitions so clicks feel acknowledged
 * when destination pages take >1s (perceived performance).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const nextKey = `${url.pathname}?${url.searchParams.toString()}`;
        const currentKey = `${window.location.pathname}?${window.location.search.slice(1)}`;
        if (nextKey === currentKey) return;
      } catch {
        return;
      }

      setActive(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      // Delay show slightly; full bar if navigation is still pending after ~200ms
      timerRef.current = window.setTimeout(() => setVisible(true), 200);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setActive(false);
    setVisible(false);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [routeKey]);

  if (!active && !visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-0.5 overflow-hidden"
      role="progressbar"
      aria-hidden={!visible}
      aria-valuetext={visible ? "Loading page" : undefined}
    >
      <div
        className={`h-full origin-left bg-[var(--accent)] transition-opacity duration-200 ${
          visible ? "opacity-100 animate-nav-progress" : "opacity-0"
        }`}
      />
    </div>
  );
}
