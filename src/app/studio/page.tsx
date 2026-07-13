"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchDashboard, type DashboardData } from "@/services/studio";
import { DeliveryMapClient } from "@/components/maps/DeliveryMapClient";
import type { MapPoint } from "@/components/maps/DeliveryMap";
import { Button } from "@/components/ui/Button";
import { formatEtb } from "@/lib/money";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudioDashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { location: sellerLocation, status: locStatus, error: locError, refresh } = useDeviceLocation(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const overview = await fetchDashboard();
        if (!cancelled) setData(overview);
      } catch (error) {
        toast(error instanceof Error ? error.message : "Failed to load dashboard", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const mapPoints = useMemo(() => {
    const points: MapPoint[] = [];
    for (const order of data?.mapOrders ?? []) {
      if (order.deliveryLat == null || order.deliveryLng == null) continue;
      points.push({
        id: order.id,
        lat: order.deliveryLat,
        lng: order.deliveryLng,
        label: `${order.reference} · ${order.customerName} (${order.status})`,
        kind: "order",
      });
    }
    if (sellerLocation) {
      points.push({
        id: "seller-device",
        lat: sellerLocation.lat,
        lng: sellerLocation.lng,
        label: "Your location",
        kind: "seller",
      });
    }
    return points;
  }, [data?.mapOrders, sellerLocation]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-[var(--muted)]">Could not load dashboard.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Monitor orders, catalog, and delivery map.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Orders", value: String(data.orders.total) },
          { label: "Open order value", value: formatEtb(data.orders.openValueEtb) },
          { label: "Products", value: String(data.products.total) },
          { label: "Available", value: String(data.products.available) },
        ].map((card) => (
          <div key={card.label} className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm text-[var(--muted)]">{card.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl">Addis Ababa deliveries</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Open orders with a saved delivery spot. Your device shows in blue when location is on.
            </p>
          </div>
          <Button type="button" variant="secondary" className="min-h-0 px-3 py-1.5 text-xs" onClick={refresh}>
            {locStatus === "loading" ? "Locating…" : "Share my location"}
          </Button>
        </div>
        <DeliveryMapClient points={mapPoints} heightClassName="h-96" />
        {locError ? <p className="text-sm text-amber-800">{locError}</p> : null}
        {(data.mapOrders?.length ?? 0) === 0 ? (
          <p className="text-sm text-[var(--muted)]">No open orders with delivery coordinates yet.</p>
        ) : null}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl">Orders by status</h2>
            <Link href="/studio/orders" className="text-sm text-[var(--accent)]">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-[var(--surface)]">
            {Object.entries(data.orders.byStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between px-4 py-3 text-sm">
                <span>{status}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl">Recent activity</h2>
            <Link href="/studio/logs" className="text-sm text-[var(--accent)]">
              View logs
            </Link>
          </div>
          <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-[var(--surface)]">
            {data.recentLogs.length === 0 ? (
              <li className="px-4 py-6 text-sm text-[var(--muted)]">No activity yet.</li>
            ) : (
              data.recentLogs.map((log) => (
                <li key={log.id} className="px-4 py-3 text-sm">
                  <p className="text-[var(--ink)]">{log.message}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {log.action} · {new Date(log.createdAt).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Recent orders</h2>
          <Link href="/studio/products/new" className="text-sm text-[var(--accent)]">
            Add product
          </Link>
        </div>
        <div className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/studio/orders/${encodeURIComponent(order.reference)}`}
                      className="text-[var(--accent)]"
                    >
                      {order.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{formatEtb(order.subtotalEtb)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
