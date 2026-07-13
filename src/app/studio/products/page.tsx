"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteSellerProduct, fetchSellerProducts, updateSellerProduct } from "@/services/studio";
import type { Product } from "@/types";
import { formatEtb } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

export default function StudioProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setProducts(await fetchSellerProducts());
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">Products</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Add, edit, or remove catalog pieces.</p>
        </div>
        <Link
          href="/studio/products/new"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--surface)]"
        >
          Add product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
          No products yet.{" "}
          <Link href="/studio/products/new" className="text-[var(--accent)] underline-offset-2 hover:underline">
            Add your first piece
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--ink)]">{product.name}</p>
                    <p className="text-xs text-[var(--muted)]">{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{product.categoryName ?? product.category}</td>
                  <td className="px-4 py-3">{formatEtb(product.priceEtb)}</td>
                  <td className="px-4 py-3">
                    {product.available ? "Available" : "Hidden"}
                    {product.featured ? " · Featured" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-0 px-3 py-1.5 text-xs"
                        loading={togglingId === product.id}
                        onClick={async () => {
                          setTogglingId(product.id);
                          try {
                            await updateSellerProduct(product.id, { available: !product.available });
                            toast(
                              product.available ? "Product hidden from shop" : "Product visible in shop",
                              "success",
                            );
                            await load();
                          } catch (error) {
                            toast(error instanceof Error ? error.message : "Update failed", "error");
                          } finally {
                            setTogglingId(null);
                          }
                        }}
                      >
                        {product.available ? "Hide" : "Show"}
                      </Button>
                      <Link
                        href={`/studio/products/${product.id}`}
                        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs hover:border-[var(--accent)]"
                      >
                        Edit
                      </Link>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-0 px-3 py-1.5 text-xs"
                        loading={deletingId === product.id}
                        onClick={async () => {
                          if (!window.confirm(`Delete “${product.name}”? This removes it from the shop.`)) return;
                          setDeletingId(product.id);
                          try {
                            await deleteSellerProduct(product.id);
                            toast("Product deleted", "success");
                            await load();
                          } catch (error) {
                            toast(error instanceof Error ? error.message : "Delete failed", "error");
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
