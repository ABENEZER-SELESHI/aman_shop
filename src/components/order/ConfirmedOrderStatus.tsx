"use client";

import { useEffect, useState } from "react";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { Skeleton } from "@/components/ui/Skeleton";
import { rememberTrackedOrder } from "@/lib/localOrders";
import { fetchPublicOrder, type PublicTrackedOrder } from "@/services/orders";

/** Live status panel on the confirmation page. */
export function ConfirmedOrderStatus({ reference }: { reference: string }) {
  const [order, setOrder] = useState<PublicTrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await fetchPublicOrder(reference);
        if (!cancelled) {
          rememberTrackedOrder(result);
          setOrder(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load status yet");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (loading) {
    return (
      <div className="mt-10 space-y-3 text-left" aria-busy="true">
        <Skeleton className="h-28" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <p className="mt-8 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm text-[var(--muted)]">
        {error ?? "Status will appear here once the order is saved."} You can still track later from{" "}
        <a href={`/order/track?ref=${encodeURIComponent(reference)}`} className="text-[var(--accent)] underline-offset-2 hover:underline">
          Track order
        </a>
        .
      </p>
    );
  }

  return (
    <div className="mt-10 text-left">
      <OrderStatusTracker order={order} />
    </div>
  );
}
