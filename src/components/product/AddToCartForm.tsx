"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCartStore } from "@/store/cart";
import { useCartDrawer } from "@/providers/CartDrawerProvider";
import { useToast } from "@/components/ui/Toast";

export function AddToCartForm({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { openDrawer } = useCartDrawer();
  const { toast } = useToast();

  if (!product.available) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--muted)]" role="status">
          Currently unavailable — ask on{" "}
          <Link href="/contact" className="text-[var(--accent)] underline-offset-2 hover:underline">
            Contact
          </Link>
          .
        </p>
        <Button type="button" disabled className="w-full sm:w-auto">
          Sold out
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        addItem(product, qty);
        toast(`${product.name} added to cart`, "success");
        openDrawer();
      }}
    >
      <div>
        <label htmlFor="qty" className="mb-2 block text-sm text-[var(--muted)]">
          Quantity
        </label>
        <QuantityStepper id="qty" value={qty} max={product.maxQuantity} onChange={setQty} />
        <p className="mt-2 text-xs text-[var(--muted)]">Up to {product.maxQuantity} per order.</p>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Add to cart
      </Button>
    </form>
  );
}
