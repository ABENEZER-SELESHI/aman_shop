import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatEtb } from "@/lib/money";
import { cn } from "@/utils/cn";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          "group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
          !product.available && "opacity-60",
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface)]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {!product.available ? (
            <span className="absolute bottom-3 left-3 text-xs uppercase tracking-wide text-[var(--ink)]">
              Currently unavailable
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-[var(--ink)]">{product.name}</p>
        <p className="text-sm text-[var(--muted)]">{formatEtb(product.priceEtb)}</p>
      </Link>
    </li>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-[var(--muted)]">
        No pieces in this collection yet. Check back soon.
      </p>
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
