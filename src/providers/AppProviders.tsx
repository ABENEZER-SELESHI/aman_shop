"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState, type ReactNode } from "react";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { ToastProvider } from "@/components/ui/Toast";
import { CartDrawerProvider } from "@/providers/CartDrawerProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CartDrawerProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </CartDrawerProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
