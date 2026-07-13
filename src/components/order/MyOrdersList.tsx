"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatEtb } from "@/lib/money";
import {
  isOpenOrderStatus,
  listLocalOrders,
  rememberTrackedOrder,
  removeLocalOrder,
  updateLocalOrderStatus,
  type SavedLocalOrder,
} from "@/lib/localOrders";
import { statusLabel } from "@/lib/orderStatus";
import { fetchPublicOrder, type PublicOrderStatus } from "@/services/orders";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

type Props = {
  onSelect?: (reference: string) => void;
  activeReference?: string;
};

export function MyOrdersList({ onSelect, activeReference }: Props) {
  const [orders, setOrders] = useState<SavedLocalOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const reloadFromStorage = useCallback(() => {
    setOrders(listLocalOrders());
  }, []);

  const refreshFromApi = useCallback(async () => {
    const saved = listLocalOrders();
    if (saved.length === 0) {
      setOrders([]);
      return;
    }
    setRefreshing(true);
    try {
      await Promise.all(
        saved.map(async (item) => {
          try {
            const live = await fetchPublicOrder(item.reference);
            rememberTrackedOrder(live);
            updateLocalOrderStatus(live.reference, live.status);
          } catch {
            // keep cached entry if lookup fails
          }
        }),
      );
      setOrders(listLocalOrders());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    reloadFromStorage();
    setHydrated(true);
    void refreshFromApi();
  }, [reloadFromStorage, refreshFromApi]);

  if (!hydrated) {
    return (
      <div className="space-y-2" aria-busy="true">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  const openOrders = orders.filter((o) => isOpenOrderStatus(o.status));

  if (orders.length === 0) {
    return (
      <p className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-5 text-sm text-[var(--muted)]">
        Orders you place on this device are saved here, so you can track them even if you forget the
        reference code.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Your open orders
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Saved on this browser · {openOrders.length} undelivered
            {orders.length > openOrders.length
              ? ` · ${orders.length - openOrders.length} finished`
              : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="min-h-0 px-3 py-1.5 text-xs"
          loading={refreshing}
          onClick={() => void refreshFromApi()}
        >
          Refresh list
        </Button>
      </div>

      {openOrders.length === 0 ? (
        <p className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-5 text-sm text-[var(--muted)]">
          No undelivered orders on this device. Place a new order, or look one up with its reference
          below.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-[var(--surface)]">
          {openOrders.map((order) => {
            const active = activeReference?.toUpperCase() === order.reference;
            return (
              <li key={order.reference}>
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
                    active && "bg-[var(--accent-soft)]/40",
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    onClick={() => onSelect?.(order.reference)}
                  >
                    <p className="font-mono text-sm font-medium tracking-wide text-[var(--ink)]">
                      {order.reference}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {statusLabel(order.status as PublicOrderStatus)}
                      {order.createdAt
                        ? ` · ${new Date(order.createdAt).toLocaleDateString()}`
                        : ""}
                      {typeof order.subtotalEtb === "number"
                        ? ` · ${formatEtb(order.subtotalEtb)}`
                        : ""}
                    </p>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/order/track?ref=${encodeURIComponent(order.reference)}`}
                      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs hover:border-[var(--accent)]"
                      onClick={() => onSelect?.(order.reference)}
                    >
                      View status
                    </Link>
                    <button
                      type="button"
                      className="rounded-md px-2 py-1.5 text-xs text-[var(--muted)] hover:text-red-700"
                      onClick={() => {
                        removeLocalOrder(order.reference);
                        reloadFromStorage();
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
