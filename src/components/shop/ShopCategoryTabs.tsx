import Link from "next/link";
import { getCategories } from "@/lib/products";
import { cn } from "@/utils/cn";

export async function ShopCategoryTabs({ active }: { active: string }) {
  const categories = await getCategories();
  const tabs = [
    { href: "/shop", slug: "all", label: "All" },
    ...categories.map((c) => ({
      href: `/shop/${c.slug}`,
      slug: c.slug,
      label: c.name,
    })),
  ];

  return (
    <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Shop categories">
      {tabs.map((tab) => {
        const isActive = active === tab.slug;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "min-h-11 rounded-md px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
              isActive
                ? "bg-[var(--accent)] text-[var(--surface)]"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
