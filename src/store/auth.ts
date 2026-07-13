"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Seller = { id: string; email: string; name: string };

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  seller: Seller | null;
  setSession: (payload: { accessToken: string; refreshToken: string; seller: Seller }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      seller: null,
      setSession: (payload) => set(payload),
      clearSession: () => set({ accessToken: null, refreshToken: null, seller: null }),
    }),
    { name: "aman-shop:seller-auth:v1" },
  ),
);
