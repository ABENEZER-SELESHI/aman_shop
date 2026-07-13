"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { logoutSeller } from "@/services/studio";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/site/BrandMark";

const links = [
  { href: "/studio", label: "Dashboard", exact: true },
  { href: "/studio/orders", label: "Orders" },
  { href: "/studio/categories", label: "Categories" },
  { href: "/studio/products", label: "Products" },
  { href: "/studio/logs", label: "Activity" },
  { href: "/studio/settings", label: "Settings" },
];

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const seller = useAuthStore((s) => s.seller);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const isLogin = pathname === "/studio/login";

  useEffect(() => {
    if (!isLogin && !accessToken) {
      router.replace("/studio/login");
    }
  }, [accessToken, isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (!accessToken) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg)] text-sm text-[var(--muted)]">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BrandMark asLink showWordmark={false} />
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl">Studio</p>
                <p className="text-sm text-[var(--muted)]">Signed in as {seller?.name ?? "Seller"}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            >
              View shop
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                if (refreshToken) await logoutSeller(refreshToken);
                clearSession();
                router.replace("/studio/login");
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6" aria-label="Studio">
          {links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm whitespace-nowrap",
                  active ? "bg-[var(--accent)] text-[var(--surface)]" : "text-[var(--muted)] hover:bg-[var(--accent-soft)]/40",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
