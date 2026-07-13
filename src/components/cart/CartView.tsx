"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatEtb } from "@/lib/money";
import { resolveMediaUrl } from "@/lib/media";
import { resolveCartAvailability, useCatalogMap } from "@/hooks/useCatalog";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { EmptyState, EmptyStateLink } from "@/components/ui/EmptyState";
import { CartLineSkeleton } from "@/components/ui/Skeleton";
import { PayInPersonBanner } from "./PayInPersonBanner";
import { useToast } from "@/components/ui/Toast";
import type { CartItem } from "@/types";

export function CartView({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const { byId, isSuccess, isError, isFetching } = useCatalogMap();
  const catalogReady = isSuccess || isError;
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const hasUnavailable = useMemo(
    () =>
      items.some((item) =>
        resolveCartAvailability(item.productId, byId, {
          catalogReady,
          cartAvailable: item.available,
          isFetching,
        }).unavailable,
      ),
    [items, byId, catalogReady, isFetching],
  );

  const handleRemove = (item: CartItem) => {
    removeItem(item.productId);
    toast(`Removed ${item.name}`, "info");
  };

  if (!hydrated) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading cart">
        <CartLineSkeleton />
        <CartLineSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Choose a vase or basket, set a quantity, and add it here. Your cart is saved in this browser."
        action={
          <>
            <EmptyStateLink href="/shop">Browse shop</EmptyStateLink>
          </>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PayInPersonBanner />
      {hasUnavailable ? (
        <p
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          Some items are no longer available. Remove them before checkout.
        </p>
      ) : null}
      <ul className="divide-y divide-[var(--border)]">
        {items.map((item) => {
          const { product, unavailable } = resolveCartAvailability(item.productId, byId, {
            catalogReady,
            cartAvailable: item.available,
            isFetching,
          });
          const maxQty = product?.maxQuantity ?? item.maxQuantity ?? item.quantity;
          return (
            <li key={item.productId} className="flex gap-4 py-5">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <Image
                  src={resolveMediaUrl(item.image)}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={item.image.includes("/uploads/")}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-medium text-[var(--ink)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-[var(--muted)]">{formatEtb(item.unitPriceEtb)}</p>
                {unavailable ? (
                  <p className="mt-1 text-xs text-amber-800">Currently unavailable</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <QuantityStepper
                    value={item.quantity}
                    max={maxQty}
                    onChange={(qty) => updateQty(item.productId, qty)}
                    disabled={unavailable}
                  />
                  <button
                    type="button"
                    className="min-h-11 text-sm text-[var(--muted)] underline-offset-2 transition-colors hover:text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    onClick={() => handleRemove(item)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-sm text-[var(--ink)]">
                {formatEtb(item.unitPriceEtb * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
        <p className="text-sm text-[var(--muted)]">Subtotal</p>
        <p className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          {formatEtb(subtotal)}
        </p>
      </div>
      {!compact ? (
        <Button
          className="min-h-11 w-full"
          disabled={hasUnavailable}
          onClick={() => router.push("/checkout")}
        >
          Continue to order
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Link
            href="/cart"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 text-center text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            View cart
          </Link>
          <Link
            href="/checkout"
            aria-disabled={hasUnavailable}
            className={`inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 text-center text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[#355f4e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${hasUnavailable ? "pointer-events-none opacity-50" : ""}`}
          >
            Continue to order
          </Link>
        </div>
      )}
    </div>
  );
}
