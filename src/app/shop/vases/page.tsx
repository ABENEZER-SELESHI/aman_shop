import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Vases",
  description: "Handmade flower vases by Amanuel at Aman Shop.",
};

export default function VasesPage() {
  const products = getProducts({ category: "vase" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">Vases</h1>
      <p className="mt-2 text-[var(--muted)]">Stoneware vessels for flowers and quiet shelves.</p>
      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
