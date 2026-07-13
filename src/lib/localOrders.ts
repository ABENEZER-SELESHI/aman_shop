import type { PublicOrderStatus, PublicTrackedOrder } from "@/services/orders";

export const LOCAL_ORDERS_KEY = "aman-shop:orders:v1";
const MAX_SAVED = 30;

export type SavedLocalOrder = {
  reference: string;
  status: PublicOrderStatus;
  customerName?: string;
  subtotalEtb?: number;
  createdAt: string;
  preferredPickup?: string;
  savedAt: string;
};

const OPEN_STATUSES: PublicOrderStatus[] = ["NEW", "CONFIRMED"];

function normalizeStatus(status: string): PublicOrderStatus {
  const upper = status.toUpperCase() as PublicOrderStatus;
  if (upper === "NEW" || upper === "CONFIRMED" || upper === "COMPLETED" || upper === "CANCELLED") {
    return upper;
  }
  return "NEW";
}

function normalizeReference(reference: string) {
  return reference.trim().toUpperCase().replace(/\s+/g, "");
}

function readAll(): SavedLocalOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedLocalOrder[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.reference === "string")
      .map((item) => ({
        ...item,
        reference: normalizeReference(item.reference),
        status: normalizeStatus(item.status ?? "NEW"),
      }));
  } catch {
    return [];
  }
}

function writeAll(orders: SavedLocalOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders.slice(0, MAX_SAVED)));
  } catch {
    // private mode / quota
  }
}

/** Persist or update an order reference on this device. */
export function rememberLocalOrder(input: {
  reference: string;
  status?: string;
  customerName?: string;
  subtotalEtb?: number;
  createdAt?: string;
  preferredPickup?: string;
}): SavedLocalOrder | null {
  const reference = normalizeReference(input.reference);
  if (!reference.startsWith("AS-")) return null;

  const now = new Date().toISOString();
  const existing = readAll();
  const next: SavedLocalOrder = {
    reference,
    status: normalizeStatus(input.status ?? "NEW"),
    customerName: input.customerName,
    subtotalEtb: input.subtotalEtb,
    createdAt: input.createdAt ?? now,
    preferredPickup: input.preferredPickup,
    savedAt: now,
  };

  const without = existing.filter((o) => o.reference !== reference);
  writeAll([next, ...without]);
  return next;
}

export function rememberTrackedOrder(order: PublicTrackedOrder) {
  rememberLocalOrder({
    reference: order.reference,
    status: order.status,
    customerName: order.customerName,
    subtotalEtb: order.subtotalEtb,
    createdAt: order.createdAt,
    preferredPickup: order.preferredPickup,
  });
}

export function listLocalOrders(): SavedLocalOrder[] {
  return readAll().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** Orders not yet completed or cancelled (still in progress). */
export function listOpenLocalOrders(): SavedLocalOrder[] {
  return listLocalOrders().filter((o) => OPEN_STATUSES.includes(o.status));
}

export function updateLocalOrderStatus(reference: string, status: PublicOrderStatus) {
  const ref = normalizeReference(reference);
  const all = readAll();
  const idx = all.findIndex((o) => o.reference === ref);
  if (idx < 0) return;
  all[idx] = { ...all[idx], status, savedAt: new Date().toISOString() };
  writeAll(all);
}

export function removeLocalOrder(reference: string) {
  const ref = normalizeReference(reference);
  writeAll(readAll().filter((o) => o.reference !== ref));
}

export function isOpenOrderStatus(status: PublicOrderStatus) {
  return OPEN_STATUSES.includes(status);
}
