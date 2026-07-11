export function PayInPersonBanner({ className }: { className?: string }) {
  return (
    <aside
      className={className}
      role="note"
    >
      <p className="rounded-md border border-[var(--accent-soft)] bg-[var(--accent-soft)]/40 px-4 py-3 text-sm text-[var(--ink)]">
        No online payment — you&apos;ll pay when you collect your order.
      </p>
    </aside>
  );
}
