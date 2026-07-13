"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { MyOrdersList } from "@/components/order/MyOrdersList";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { rememberTrackedOrder } from "@/lib/localOrders";
import { fetchPublicOrder, type PublicTrackedOrder } from "@/services/orders";

function normalizeReference(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function TrackOrderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") ?? "";

  const [referenceInput, setReferenceInput] = useState(initialRef);
  const [order, setOrder] = useState<PublicTrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listKey, setListKey] = useState(0);

  async function lookup(reference: string) {
    const normalized = normalizeReference(reference);
    if (!normalized) {
      setError("Enter your order reference.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchPublicOrder(normalized);
      rememberTrackedOrder(result);
      setOrder(result);
      setListKey((k) => k + 1);
      router.replace(`/order/track?ref=${encodeURIComponent(result.reference)}`, { scroll: false });
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Could not find that order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialRef) {
      setReferenceInput(initialRef);
      void lookup(initialRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void lookup(referenceInput);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">Orders</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Track your order
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Open orders from this device appear below. You can also enter any reference that starts with{" "}
          <span className="font-medium text-[var(--ink)]">AS-</span>.
        </p>
      </div>

      <div className="mb-10">
        <MyOrdersList
          key={listKey}
          activeReference={order?.reference}
          onSelect={(reference) => {
            setReferenceInput(reference);
            void lookup(reference);
          }}
        />
      </div>

      <div className="mb-3 border-t border-[var(--border)] pt-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Look up by reference
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Use this if the order was placed on another device or is not in your list.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <label htmlFor="order-ref" className="sr-only">
            Order reference
          </label>
          <input
            id="order-ref"
            value={referenceInput}
            onChange={(e) => setReferenceInput(e.target.value.toUpperCase())}
            placeholder="AS-AB12CD"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 font-mono text-sm tracking-wide text-[var(--ink)] placeholder:text-[var(--muted)]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />
        </div>
        <Button type="submit" loading={loading} className="min-h-11 sm:w-auto">
          {loading ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {error ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {error}
        </p>
      ) : null}

      {loading && !order ? (
        <div className="mt-8 space-y-3" aria-busy="true">
          <Skeleton className="h-28" />
          <Skeleton className="h-40" />
        </div>
      ) : null}

      {order ? (
        <div className="mt-10">
          <OrderStatusTracker order={order} />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => void lookup(order.reference)}>
              Refresh status
            </Button>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] px-5 text-sm text-[var(--ink)]"
            >
              Contact seller
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-6 h-12 w-full" />
        </div>
      }
    >
      <TrackOrderInner />
    </Suspense>
  );
}
