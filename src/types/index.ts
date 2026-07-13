export type ProductCategory = string;

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categoryName?: string;
  categoryId?: string;
  priceEtb: number;
  description: string;
  materials: string;
  dimensions: string;
  care: string;
  images: string[];
  featured: boolean;
  available: boolean;
  maxQuantity: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  unitPriceEtb: number;
  quantity: number;
  image: string;
  category: ProductCategory;
  /** Snapshot from catalog when added; used for qty caps offline. */
  maxQuantity?: number;
  /** Snapshot — true when added from an available product page. */
  available?: boolean;
}

export interface CartState {
  items: CartItem[];
  updatedAt: string;
}

export type OrderStatus = "new" | "confirmed" | "completed" | "cancelled";

export interface OrderLine {
  productId: string;
  name: string;
  unitPriceEtb: number;
  quantity: number;
  lineTotalEtb: number;
}

export interface Order {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerNote: string;
  preferredPickup: string;
  lines: OrderLine[];
  subtotalEtb: number;
  payInPerson: true;
}

export const PICKUP_OPTIONS = [
  "Weekday morning",
  "Weekday afternoon",
  "Weekend",
  "Flexible / message me",
] as const;

export type PickupOption = (typeof PICKUP_OPTIONS)[number];

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerNote?: string;
  preferredPickup: PickupOption;
  deliveryLat: number;
  deliveryLng: number;
  deliveryAccuracyM?: number | null;
  lines: Array<{
    productId: string;
    name: string;
    unitPriceEtb: number;
    quantity: number;
  }>;
  subtotalEtb: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: string[];
}
