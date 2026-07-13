export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-busy="true" aria-label="Loading checkout">
      <div className="h-10 w-56 animate-pulse rounded bg-[var(--border)]/70" />
      <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-[var(--border)]/70" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded-md bg-[var(--border)]/70" />
          <div className="h-11 animate-pulse rounded-md bg-[var(--border)]/70" />
          <div className="h-11 animate-pulse rounded-md bg-[var(--border)]/70" />
          <div className="h-11 animate-pulse rounded-md bg-[var(--border)]/70" />
          <div className="h-28 animate-pulse rounded-md bg-[var(--border)]/70" />
        </div>
        <div className="h-48 animate-pulse rounded-md bg-[var(--border)]/70" />
      </div>
      <p className="sr-only">Preparing checkout…</p>
    </div>
  );
}
