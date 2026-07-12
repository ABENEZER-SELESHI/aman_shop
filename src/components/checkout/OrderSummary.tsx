"use client";

import { useCartStore } from "@/store/cart";
import { formatEtb } from "@/lib/money";

export function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        Order summary
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4 text-sm">
            <span className="text-[var(--muted)]">
              {item.name} × {item.quantity}
            </span>
            <span className="text-[var(--ink)]">
              {formatEtb(item.unitPriceEtb * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4">
        <span className="text-sm text-[var(--muted)]">Subtotal</span>
        <span className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          {formatEtb(subtotal)}
        </span>
      </div>
    </div>
  );
}
