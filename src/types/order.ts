import type { PICKUP_OPTIONS } from "../constants/index.js";

export type PreferredPickup = (typeof PICKUP_OPTIONS)[number];

export type OrderLine = {
  productId: string;
  name: string;
  unitPriceEtb: number;
  quantity: number;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerNote?: string;
  preferredPickup: PreferredPickup;
  lines: OrderLine[];
  subtotalEtb: number;
  deliveryLat: number;
  deliveryLng: number;
  deliveryAccuracyM?: number | null;
};
