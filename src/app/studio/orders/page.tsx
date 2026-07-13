"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchSellerOrders,
  updateOrderStatus,
  type StudioOrder,
} from "@/services/studio";
import { formatEtb } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const STATUSES: Array<StudioOrder["status"] | "ALL"> = [
  "ALL",
  "NEW",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const NEXT: Record<StudioOrder["status"], StudioOrder["status"][]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export default function StudioOrdersPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("ALL");
  const [orders, setOrders] = useState<StudioOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load(status: (typeof STATUSES)[number]) {
    setLoading(true);
    try {
      setOrders(await fetchSellerOrders(status === "ALL" ? undefined : status));
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const sorted = useMemo(
    () => [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Track deliveries and update fulfillment status. Open an order to view the delivery map.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={
              filter === status
                ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-[var(--surface)]"
                : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            }
          >
            {status === "ALL" ? "All" : status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
          No orders in this view.
        </p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((order) => {
            const lines = Array.isArray(order.lines) ? order.lines : [];
            const next = NEXT[order.status];
            const hasDelivery = order.deliveryLat != null && order.deliveryLng != null;
            return (
              <li
                key={order.id}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/studio/orders/${encodeURIComponent(order.reference)}`}
                      className="font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                    >
                      {order.reference}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {order.customerName} · {order.customerPhone}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Pickup: {order.preferredPickup} · {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {hasDelivery ? "Delivery location saved" : "No delivery location"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.status}</p>
                    <p className="mt-1 text-sm">{formatEtb(order.subtotalEtb)}</p>
                    <Link
                      href={`/studio/orders/${encodeURIComponent(order.reference)}`}
                      className="mt-2 inline-block text-sm text-[var(--accent)]"
                    >
                      Open map →
                    </Link>
                  </div>
                </div>

                {order.customerNote ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">Note: {order.customerNote}</p>
                ) : null}

                <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
                  {lines.map((line, index) => {
                    const item = line as {
                      name?: string;
                      quantity?: number;
                      unitPriceEtb?: number;
                    };
                    return (
                      <li key={`${order.id}-${index}`}>
                        {item.quantity ?? "?"}× {item.name ?? "Item"}
                        {typeof item.unitPriceEtb === "number"
                          ? ` · ${formatEtb(item.unitPriceEtb)}`
                          : ""}
                      </li>
                    );
                  })}
                </ul>

                {next.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {next.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={status === "CANCELLED" ? "secondary" : "primary"}
                        className="min-h-0 px-3 py-2 text-xs"
                        loading={updating === `${order.reference}:${status}`}
                        onClick={async () => {
                          setUpdating(`${order.reference}:${status}`);
                          try {
                            await updateOrderStatus(order.reference, status);
                            toast(`Order marked ${status}`, "success");
                            await load(filter);
                          } catch (error) {
                            toast(error instanceof Error ? error.message : "Update failed", "error");
                          } finally {
                            setUpdating(null);
                          }
                        }}
                      >
                        Mark {status}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
