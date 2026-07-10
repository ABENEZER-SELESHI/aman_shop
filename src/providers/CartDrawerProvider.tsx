"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface CartDrawerContextValue {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openDrawer, closeDrawer }),
    [open, openDrawer, closeDrawer],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer(): CartDrawerContextValue {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used within CartDrawerProvider");
  return ctx;
}
