import axios from "axios";
import { siteConfig } from "@/lib/config";
import type { ApiError, ApiSuccess, CreateOrderPayload, Order } from "@/types";

const client = axios.create({
  baseURL: siteConfig.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  try {
    const { data } = await client.post<ApiSuccess<Order>>("/orders", payload);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const body = error.response.data as ApiError;
      throw new Error(body.message || body.errors?.[0] || "Could not place order");
    }
    throw new Error("Could not place order. Please try again.");
  }
}

export async function getOrderByReference(reference: string): Promise<Order> {
  const { data } = await client.get<ApiSuccess<Order>>(`/orders/${reference}`);
  return data.data;
}
