import Link from "next/link";

export function CategoryPaths() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        <Link
          href="/shop/vases"
          className="group border-b border-[var(--border)] px-4 py-16 transition-colors hover:bg-[var(--bg)] sm:px-8 md:border-b-0 md:border-r focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Explore</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] group-hover:text-[var(--accent)]">
            Vases
          </h2>
          <p className="mt-3 max-w-sm text-[var(--muted)]">
            Stoneware forms for stems, branches, and quiet shelves.
          </p>
        </Link>
        <Link
          href="/shop/baskets"
          className="group px-4 py-16 transition-colors hover:bg-[var(--bg)] sm:px-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Explore</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] group-hover:text-[var(--accent)]">
            Baskets
          </h2>
          <p className="mt-3 max-w-sm text-[var(--muted)]">
            Woven pieces for markets, storage, and everyday beauty.
          </p>
        </Link>
      </div>
    </section>
  );
}
