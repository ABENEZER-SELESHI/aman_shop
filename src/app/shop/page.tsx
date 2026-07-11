import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse all handmade vases and baskets at Aman Shop.",
};

export default function ShopPage() {
  const products = getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">Shop</h1>
      <p className="mt-2 text-[var(--muted)]">All handmade pieces — vases and baskets.</p>
      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
