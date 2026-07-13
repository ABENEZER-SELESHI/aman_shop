import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopCategoryTabs } from "@/components/shop/ShopCategoryTabs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse handmade pieces at Aman Shop.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Shop" }]} />
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">Shop</h1>
      <p className="mt-2 text-[var(--muted)]">All handmade pieces currently in the shop.</p>
      <div className="mt-8">
        <ShopCategoryTabs active="all" />
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
