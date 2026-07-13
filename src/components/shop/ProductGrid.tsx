"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatEtb } from "@/lib/money";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/utils/cn";
import { EmptyState, EmptyStateLink } from "@/components/ui/EmptyState";
import { ProductCardPending } from "@/components/shop/ProductCardPending";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const imageSrc = resolveMediaUrl(product.images[0] ?? "");
  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <Link
        href={`/product/${product.slug}`}
        prefetch
        className={cn(
          "group relative block transition-[transform,opacity] duration-150 motion-reduce:transition-none",
          "active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
          !product.available && "opacity-60",
        )}
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
          {!product.available ? (
            <span className="absolute bottom-3 left-3 z-[3] bg-[var(--surface)]/90 px-2 py-1 text-xs uppercase tracking-wide text-[var(--ink)]">
              Currently unavailable
            </span>
          ) : null}
          <ProductCardPending />
        </div>
        <p className="mt-3 text-sm text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
          {product.name}
        </p>
        <p className="text-sm text-[var(--muted)]">{formatEtb(product.priceEtb)}</p>
      </Link>
    </li>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Nothing in this collection yet"
        description="New pieces appear here when Amanuel adds them. Browse the full shop in the meantime."
        action={<EmptyStateLink href="/shop">View all pieces</EmptyStateLink>}
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </ul>
  );
}
