"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCartDrawer } from "@/providers/CartDrawerProvider";
import { CartView } from "./CartView";
import { cn } from "@/utils/cn";

export function CartDrawer() {
  const { open, closeDrawer } = useCartDrawer();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, closeDrawer]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-[var(--ink)]/30 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeDrawer}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[var(--bg)] shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">Cart</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            className="rounded-md p-2 text-[var(--ink)] hover:bg-[var(--accent-soft)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <CartView compact />
        </div>
      </aside>
    </>
  );
}
