"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  fetchSellerOrder,
  updateOrderStatus,
  type StudioOrder,
} from "@/services/studio";
import { DeliveryMapClient } from "@/components/maps/DeliveryMapClient";
import type { MapPoint } from "@/components/maps/DeliveryMap";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { formatEtb } from "@/lib/money";

const NEXT: Record<StudioOrder["status"], StudioOrder["status"][]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export default function StudioOrderDetailPage() {
  const params = useParams<{ reference: string }>();
  const reference = decodeURIComponent(params.reference ?? "");
  const { toast } = useToast();
  const [order, setOrder] = useState<StudioOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { location: sellerLocation, status: locStatus, error: locError, refresh } = useDeviceLocation(true);

  async function load() {
    setLoading(true);
    try {
      setOrder(await fetchSellerOrder(reference));
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not load order", "error");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (reference) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const mapPoints = useMemo(() => {
    const points: MapPoint[] = [];
    if (order?.deliveryLat != null && order.deliveryLng != null) {
      points.push({
        id: `delivery-${order.id}`,
        lat: order.deliveryLat,
        lng: order.deliveryLng,
        label: `Delivery · ${order.reference} · ${order.customerName}`,
        kind: "delivery",
      });
    }
    if (sellerLocation) {
      points.push({
        id: "seller",
        lat: sellerLocation.lat,
        lng: sellerLocation.lng,
        label: "Your location",
        kind: "seller",
      });
    }
    return points;
  }, [order, sellerLocation]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link href="/studio/orders" className="text-sm text-[var(--accent)]">
          ← Orders
        </Link>
        <p className="text-[var(--muted)]">Order not found.</p>
      </div>
    );
  }

  const lines = Array.isArray(order.lines) ? order.lines : [];
  const next = NEXT[order.status];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/studio/orders" className="text-sm text-[var(--accent)]">
          ← Orders
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">{order.reference}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {order.status} · {formatEtb(order.subtotalEtb)} · {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Customer</h2>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm text-[var(--muted)]">{order.customerPhone}</p>
          <p className="text-sm text-[var(--muted)]">Pickup preference: {order.preferredPickup}</p>
          {order.customerNote ? <p className="text-sm text-[var(--muted)]">Note: {order.customerNote}</p> : null}
          <ul className="space-y-1 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted)]">
            {lines.map((line, index) => {
              const item = line as { name?: string; quantity?: number; unitPriceEtb?: number };
              return (
                <li key={`${order.id}-${index}`}>
                  {item.quantity ?? "?"}× {item.name ?? "Item"}
                  {typeof item.unitPriceEtb === "number" ? ` · ${formatEtb(item.unitPriceEtb)}` : ""}
                </li>
              );
            })}
          </ul>
          {next.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {next.map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={status === "CANCELLED" ? "secondary" : "primary"}
                  className="min-h-0 px-3 py-2 text-xs"
                  loading={updating === status}
                  onClick={async () => {
                    setUpdating(status);
                    try {
                      const updated = await updateOrderStatus(order.reference, status);
                      setOrder(updated);
                      toast(`Order marked ${status}`, "success");
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
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-xl">Delivery map</h2>
            <Button type="button" variant="secondary" className="min-h-0 px-3 py-1.5 text-xs" onClick={refresh}>
              {locStatus === "loading" ? "Locating…" : "Refresh my location"}
            </Button>
          </div>
          {order.deliveryLat == null || order.deliveryLng == null ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This order has no delivery coordinates.
            </p>
          ) : (
            <DeliveryMapClient points={mapPoints} heightClassName="h-80" />
          )}
          {locError ? <p className="text-sm text-amber-800">{locError}</p> : null}
          {sellerLocation ? (
            <p className="text-xs text-[var(--muted)] tabular-nums">
              Your location: {sellerLocation.lat.toFixed(5)}, {sellerLocation.lng.toFixed(5)}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
