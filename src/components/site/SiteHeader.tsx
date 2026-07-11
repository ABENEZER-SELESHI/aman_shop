"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";
import { useCartStore } from "@/store/cart";
import { useCartDrawer } from "@/providers/CartDrawerProvider";
import { cn } from "@/utils/cn";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const count = useCartStore((s) => s.count());
  const { openDrawer } = useCartDrawer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandMark />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/shop"
            className="text-sm text-[var(--muted)] md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            Shop
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            className={cn(
              "relative rounded-md p-2 text-[var(--ink)] transition-colors hover:bg-[var(--accent-soft)]/50",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
            )}
            aria-label={mounted ? `Open cart, ${count} items` : "Open cart"}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {mounted && count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-medium text-[var(--surface)]">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
