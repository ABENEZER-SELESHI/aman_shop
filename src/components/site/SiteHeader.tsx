"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { BrandMark } from "./BrandMark";
import { useCartStore } from "@/store/cart";
import { useCartDrawer } from "@/providers/CartDrawerProvider";
import { cn } from "@/utils/cn";

const nav = [
  { href: "/shop", label: "Shop", match: (path: string) => path.startsWith("/shop") || path.startsWith("/product") },
  { href: "/order/track", label: "Track order", match: (path: string) => path.startsWith("/order") },
  { href: "/about", label: "About", match: (path: string) => path.startsWith("/about") },
  { href: "/contact", label: "Contact", match: (path: string) => path.startsWith("/contact") },
];

export function SiteHeader() {
  const pathname = usePathname();
  const count = useCartStore((s) => s.count());
  const { openDrawer } = useCartDrawer();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (pathname.startsWith("/studio")) return null;
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <BrandMark />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
                  active ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    className="absolute -bottom-1 left-0 h-px w-full bg-[var(--highlight)]"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--ink)] transition-colors hover:bg-[var(--accent-soft)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={openDrawer}
            className={cn(
              "relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--ink)] transition-colors hover:bg-[var(--accent-soft)]/50",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
            )}
            aria-label={mounted ? `Open cart, ${count} items` : "Open cart"}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {mounted && count > 0 ? (
              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-medium text-[var(--surface)]">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav
          id={menuId}
          className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]",
                      active ? "bg-[var(--accent-soft)]/50 text-[var(--ink)]" : "text-[var(--muted)]",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/cart"
                className="block rounded-md px-3 py-3 text-sm text-[var(--muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                Cart
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
