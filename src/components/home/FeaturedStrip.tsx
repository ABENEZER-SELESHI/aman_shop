"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatEtb } from "@/lib/money";
import { resolveMediaUrl } from "@/lib/media";
import { ProductCardPending } from "@/components/shop/ProductCardPending";

export function FeaturedStrip({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            Featured pieces
          </h2>
          <p className="mt-2 text-[var(--muted)]">A few vessels and weaves ready for your home.</p>
        </div>
        <Link
          href="/shop"
          className="hidden text-sm text-[var(--accent)] underline-offset-4 hover:underline sm:inline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          View all
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
        {products.map((product, index) => {
          const imageSrc = resolveMediaUrl(product.images[0] ?? "");
          return (
            <li
              key={product.id}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
            >
              <Link
                href={`/product/${product.slug}`}
                prefetch
                className="group relative block transition-[transform,opacity] duration-150 motion-reduce:transition-none active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface)]">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    unoptimized={imageSrc.includes("/uploads/")}
                  />
                  <ProductCardPending />
                </div>
                <p className="mt-3 text-sm text-[var(--ink)]">{product.name}</p>
                <p className="text-sm text-[var(--muted)]">{formatEtb(product.priceEtb)}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
