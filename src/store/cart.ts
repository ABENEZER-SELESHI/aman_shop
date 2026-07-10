"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/lib/config";
import { getProductById } from "@/lib/products";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  updatedAt: string;
  addItem: (product: Product, quantity: number) => void;
  updateQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  count: () => number;
  hasUnavailable: () => boolean;
}

function toCartItem(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    unitPriceEtb: product.priceEtb,
    quantity,
    image: product.images[0] ?? "",
    category: product.category,
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      updatedAt: new Date().toISOString(),

      addItem: (product, quantity) => {
        if (!product.available) return;
        const capped = Math.min(Math.max(1, quantity), product.maxQuantity);
        const existing = get().items.find((i) => i.productId === product.id);
        const nextItems = existing
          ? get().items.map((i) =>
              i.productId === product.id
                ? {
                    ...i,
                    quantity: Math.min(i.quantity + capped, product.maxQuantity),
                  }
                : i,
            )
          : [...get().items, toCartItem(product, capped)];

        set({ items: nextItems, updatedAt: new Date().toISOString() });
      },

      updateQty: (productId, quantity) => {
        const product = getProductById(productId);
        const max = product?.maxQuantity ?? 99;
        const nextQty = Math.min(Math.max(1, quantity), max);
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: nextQty } : i,
          ),
          updatedAt: new Date().toISOString(),
        });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
          updatedAt: new Date().toISOString(),
        });
      },

      clearCart: () => {
        set({ items: [], updatedAt: new Date().toISOString() });
      },

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPriceEtb * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      hasUnavailable: () =>
        get().items.some((i) => {
          const product = getProductById(i.productId);
          return !product || !product.available;
        }),
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);
