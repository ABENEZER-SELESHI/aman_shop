import axios, { isAxiosError } from "axios";
import { siteConfig } from "@/lib/config";
import type { ApiError, ApiSuccess, CreateOrderPayload, Order } from "@/types";

const client = axios.create({
  baseURL: siteConfig.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const retryable =
        !status || status >= 500 || error instanceof Error && error.message.includes("timeout");
      if (!retryable || i === attempts - 1) throw error;
      await sleep(400 * (i + 1));
    }
  }
  throw lastError;
}

export type PublicOrderStatus = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type PublicTrackedOrder = {
  id: string;
  reference: string;
  status: PublicOrderStatus;
  preferredPickup: string;
  subtotalEtb: number;
  payInPerson: boolean;
  createdAt: string;
  lines: Array<{
    productId?: string;
    name?: string;
    unitPriceEtb?: number;
    quantity?: number;
  }>;
  customerName: string;
  customerPhoneMasked: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
};

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  try {
    const data = await withRetry(async () => {
      const response = await client.post<ApiSuccess<Order>>("/orders", payload);
      return response.data.data;
    });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      const body = error.response.data as ApiError;
      throw new Error(body.message || body.errors?.[0] || "Could not place order");
    }
    throw new Error("Could not place order. Check your connection and try again.");
  }
}

export async function fetchPublicOrder(reference: string): Promise<PublicTrackedOrder> {
  const normalized = reference.trim().toUpperCase();
  try {
    const { data } = await client.get<ApiSuccess<PublicTrackedOrder>>(
      `/orders/${encodeURIComponent(normalized)}`,
    );
    const order = data.data;
    return {
      ...order,
      lines: Array.isArray(order.lines) ? order.lines : [],
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new Error("No order found with that reference. Check the code and try again.");
    }
    if (isAxiosError(error) && error.response?.status === 400) {
      throw new Error("Enter a valid order reference (for example AS-AB12CD).");
    }
    if (isAxiosError(error) && error.response?.data) {
      const body = error.response.data as ApiError;
      throw new Error(body.message || body.errors?.[0] || "Could not look up this order");
    }
    throw new Error("Could not look up this order. Check your connection and try again.");
  }
}
