import axios, { AxiosHeaders, isAxiosError } from "axios";
import { siteConfig } from "@/lib/config";
import type { ApiError, ApiSuccess, Category, Product } from "@/types";
import { useAuthStore } from "@/store/auth";

const client = axios.create({
  baseURL: siteConfig.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const headers = AxiosHeaders.from(config.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    headers.delete("Content-Type");
  }
  config.headers = headers;
  return config;
});

function unwrapError(error: unknown, fallback: string): never {
  if (isAxiosError(error) && error.response?.data) {
    const body = error.response.data as ApiError;
    throw new Error(body.message || body.errors?.[0] || fallback);
  }
  throw new Error(fallback);
}

export type StudioProductInput = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  priceEtb: number;
  description: string;
  materials: string;
  dimensions: string;
  care: string;
  images: string[];
  featured: boolean;
  available: boolean;
  maxQuantity: number;
};

export type StudioCategoryInput = {
  slug?: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type StudioOrder = {
  id: string;
  reference: string;
  status: "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  customerName: string;
  customerPhone: string;
  customerNote: string;
  preferredPickup: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryAccuracyM?: number | null;
  lines: unknown;
  subtotalEtb: number;
  payInPerson: boolean;
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  actorType: string;
  actorId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  message: string;
  metadata: unknown;
  createdAt: string;
};

export type DashboardMapOrder = {
  id: string;
  reference: string;
  status: string;
  customerName: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  createdAt: string;
};

export type DashboardData = {
  orders: {
    total: number;
    byStatus: Record<string, number>;
    openValueEtb: number;
  };
  products: {
    total: number;
    available: number;
    unavailable: number;
  };
  recentOrders: StudioOrder[];
  recentLogs: ActivityLog[];
  mapOrders: DashboardMapOrder[];
};

export async function loginSeller(email: string, password: string) {
  try {
    const { data } = await client.post<
      ApiSuccess<{ accessToken: string; refreshToken: string; seller: { id: string; email: string; name: string } }>
    >("/auth/login", { email, password });
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not sign in");
  }
}

export async function logoutSeller(refreshToken: string) {
  try {
    await client.post("/auth/logout", { refreshToken });
  } catch {
    // still clear local session
  }
}

export async function fetchDashboard() {
  try {
    const { data } = await client.get<ApiSuccess<DashboardData>>("/studio/dashboard");
    return {
      ...data.data,
      mapOrders: data.data.mapOrders ?? [],
    };
  } catch (error) {
    unwrapError(error, "Could not load dashboard");
  }
}

export async function fetchSellerProducts() {
  try {
    const { data } = await client.get<ApiSuccess<Product[]>>("/seller/products");
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not load products");
  }
}

export async function fetchSellerCategories() {
  try {
    const { data } = await client.get<ApiSuccess<Category[]>>("/seller/categories");
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not load categories");
  }
}

export async function createSellerCategory(payload: StudioCategoryInput) {
  try {
    const { data } = await client.post<ApiSuccess<Category>>("/seller/categories", payload);
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not create category");
  }
}

export async function updateSellerCategory(id: string, payload: Partial<StudioCategoryInput>) {
  try {
    const { data } = await client.patch<ApiSuccess<Category>>(`/seller/categories/${id}`, payload);
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not update category");
  }
}

export async function deleteSellerCategory(id: string) {
  try {
    await client.delete(`/seller/categories/${id}`);
  } catch (error) {
    unwrapError(error, "Could not delete category");
  }
}

export async function fetchSellerProduct(id: string) {
  try {
    const { data } = await client.get<ApiSuccess<Product>>(`/seller/products/${id}`);
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not load product");
  }
}

export async function createSellerProduct(payload: StudioProductInput) {
  try {
    const { data } = await client.post<ApiSuccess<Product>>("/seller/products", payload);
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not create product");
  }
}

export async function updateSellerProduct(id: string, payload: Partial<StudioProductInput>) {
  try {
    const { data } = await client.patch<ApiSuccess<Product>>(`/seller/products/${id}`, payload);
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not update product");
  }
}

export async function changeSellerPassword(currentPassword: string, newPassword: string) {
  try {
    const { data } = await client.post<ApiSuccess<Record<string, never>>>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not change password");
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setSession, clearSession } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<
      ApiSuccess<{ accessToken: string; refreshToken: string; seller: { id: string; email: string; name: string } }>
    >(`${siteConfig.apiBaseUrl}/auth/refresh`, { refreshToken });
    setSession(data.data);
    return data.data.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as { _retry?: boolean; headers?: Record<string, string> } | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return client.request(original);
      }
    }
    return Promise.reject(error);
  },
);

export async function uploadSellerProductImages(files: File[]) {
  if (files.length === 0) return [] as string[];
  const form = new FormData();
  for (const file of files) {
    form.append("images", file);
  }
  try {
    const { data } = await client.post<ApiSuccess<{ urls: string[] }>>("/seller/uploads", form, {
      timeout: 60_000,
    });
    return data.data.urls;
  } catch (error) {
    unwrapError(error, "Could not upload images");
  }
}

export async function deleteSellerProduct(id: string) {
  try {
    await client.delete(`/seller/products/${id}`);
  } catch (error) {
    unwrapError(error, "Could not delete product");
  }
}

export async function fetchSellerOrder(reference: string) {
  try {
    const { data } = await client.get<ApiSuccess<StudioOrder>>(`/orders/${encodeURIComponent(reference)}`);
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not load order");
  }
}

export async function fetchSellerOrders(status?: string) {
  try {
    const { data } = await client.get<ApiSuccess<StudioOrder[]>>("/orders", {
      params: status ? { status } : undefined,
    });
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not load orders");
  }
}

export async function updateOrderStatus(reference: string, status: StudioOrder["status"]) {
  try {
    const { data } = await client.patch<ApiSuccess<StudioOrder>>(`/orders/${reference}/status`, { status });
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not update order");
  }
}

export async function fetchActivityLogs() {
  try {
    const { data } = await client.get<ApiSuccess<ActivityLog[]>>("/studio/logs", { params: { limit: 100 } });
    return data.data;
  } catch (error) {
    unwrapError(error, "Could not load activity logs");
  }
}

export async function fetchPublicProducts(filter?: { category?: string; featured?: boolean }) {
  const { data } = await client.get<ApiSuccess<Product[]>>("/products", {
    params: {
      category: filter?.category,
      featured: filter?.featured ? "true" : undefined,
    },
  });
  return data.data;
}
