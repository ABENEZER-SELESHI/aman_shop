"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { siteConfig } from "@/lib/config";
import { getLocalProducts } from "@/lib/products";
import type { ApiSuccess, Product } from "@/types";

async function fetchPublicCatalog(): Promise<Product[]> {
  const response = await fetch(`${siteConfig.apiBaseUrl}/products`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Catalog API ${response.status}`);
  }
  const body = (await response.json()) as ApiSuccess<Product[]>;
  return body.data;
}

/** Live shop catalog for client cart / availability checks. */
export function useCatalogMap() {
  const query = useQuery({
    queryKey: ["catalog", "public"],
    queryFn: fetchPublicCatalog,
    // Always refetch when cart/checkout mounts so newly added studio products aren't stale.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const byId = useMemo(() => {
    const map = new Map<string, Product>();
    const source = query.data ?? (query.isError ? getLocalProducts() : []);
    for (const product of source) {
      map.set(product.id, product);
    }
    return map;
  }, [query.data, query.isError]);

  return { ...query, byId };
}

/**
 * Cart availability from live catalog.
 * While loading/refetching, keep previously known products available so checkout isn't blocked.
 * If a product is missing after a successful fetch, treat as unavailable (removed/hidden).
 */
export function resolveCartAvailability(
  productId: string,
  byId: Map<string, Product>,
  options: {
    catalogReady: boolean;
    /** Snapshot from when the item was added — used while catalog is still refreshing. */
    cartAvailable?: boolean;
    isFetching?: boolean;
  },
): { product: Product | null; unavailable: boolean } {
  const product = byId.get(productId) ?? null;

  if (product) {
    return { product, unavailable: !product.available };
  }

  // Not in map yet
  if (!options.catalogReady || options.isFetching) {
    return { product: null, unavailable: options.cartAvailable === false };
  }

  // Fresh catalog loaded and product is gone
  return { product: null, unavailable: true };
}
