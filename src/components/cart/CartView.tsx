"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { formatEtb } from "@/lib/money";
import { getProductById } from "@/lib/products";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { PayInPersonBanner } from "./PayInPersonBanner";

export function CartView({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const hasUnavailable = useCartStore((s) => s.hasUnavailable());

  if (items.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-[var(--muted)]">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-4 inline-block text-sm text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          Browse the shop
        </Link>
      </div>
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
          const product = getProductById(item.productId);
          const unavailable = !product || !product.available;
          return (
            <li key={item.productId} className="flex gap-4 py-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--surface)]">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
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
                    max={product?.maxQuantity ?? item.quantity}
                    onChange={(qty) => updateQty(item.productId, qty)}
                    disabled={unavailable}
                  />
                  <button
                    type="button"
                    className="text-sm text-[var(--muted)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    onClick={() => removeItem(item.productId)}
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
          className="w-full"
          disabled={hasUnavailable}
          onClick={() => router.push("/checkout")}
        >
          Continue to order
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Link
            href="/cart"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-center text-sm font-medium text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            View cart
          </Link>
          <Link
            href="/checkout"
            aria-disabled={hasUnavailable}
            className={`rounded-md bg-[var(--accent)] px-5 py-2.5 text-center text-sm font-medium text-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${hasUnavailable ? "pointer-events-none opacity-50" : ""}`}
          >
            Continue to order
          </Link>
        </div>
      )}
    </div>
  );
}
