import Link from "next/link";
import { getCategories } from "@/lib/products";

export async function CategoryPaths() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)]">
      <div
        className={`mx-auto grid max-w-6xl ${categories.length === 1 ? "grid-cols-1" : "md:grid-cols-2"}`}
      >
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/shop/${category.slug}`}
            className={`group px-4 py-16 transition-colors hover:bg-[var(--bg)] sm:px-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
              index < categories.length - 1
                ? "border-b border-[var(--border)] md:border-b-0 md:border-r"
                : ""
            }`}
          >
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Explore</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] group-hover:text-[var(--accent)]">
              {category.name}
            </h2>
            <p className="mt-3 max-w-sm text-[var(--muted)]">
              {category.description || `Browse ${category.name.toLowerCase()} in the shop.`}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
