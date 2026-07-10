export type ProductCategory = "vase" | "basket";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
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
