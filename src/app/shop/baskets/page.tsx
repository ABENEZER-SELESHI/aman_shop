import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Baskets",
  description: "Handmade woven baskets by Amanuel at Aman Shop.",
};

export default function BasketsPage() {
  const products = getProducts({ category: "basket" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">Baskets</h1>
      <p className="mt-2 text-[var(--muted)]">Woven pieces for everyday beauty and storage.</p>
      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
