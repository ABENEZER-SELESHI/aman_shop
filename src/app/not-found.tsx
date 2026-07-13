import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">404</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        Page not found
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        That page isn’t part of Aman Shop. Head back to the shop or home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center rounded-md bg-[var(--accent)] px-5 text-sm font-medium text-[var(--surface)]"
        >
          Browse shop
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--ink)]"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
