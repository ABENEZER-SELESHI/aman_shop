import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopCategoryTabs } from "@/components/shop/ShopCategoryTabs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/products";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Shop" };
  return {
    title: category.name,
    description: category.description || `${category.name} at Aman Shop.`,
  };
}

export default async function ShopCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProducts({ category: category.slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
          { label: category.name },
        ]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {category.name}
      </h1>
      {category.description ? (
        <p className="mt-2 text-[var(--muted)]">{category.description}</p>
      ) : null}
      <div className="mt-8">
        <ShopCategoryTabs active={category.slug} />
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
