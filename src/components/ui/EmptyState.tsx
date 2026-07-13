import Link from "next/link";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("mx-auto max-w-md py-12 text-center", className)} role="status">
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)]/60"
        aria-hidden
      >
        <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--accent)]">AS</span>
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export function EmptyStateLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[#355f4e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {children}
    </Link>
  );
}
