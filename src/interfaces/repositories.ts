import type { Order, OrderStatus, RefreshToken, Seller } from "@prisma/client";
import type { CreateOrderInput } from "../types/order.js";

export type CreateOrderRecord = CreateOrderInput & {
  reference: string;
  payInPerson: true;
  status: OrderStatus;
  customerNote: string;
};

export type OrderListFilters = {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
};

export interface IOrderRepository {
  create(data: CreateOrderRecord): Promise<Order>;
  findByReference(reference: string): Promise<Order | null>;
  list(filters?: OrderListFilters): Promise<Order[]>;
  updateStatus(reference: string, status: OrderStatus): Promise<Order>;
}

export interface ISellerRepository {
  findByEmail(email: string): Promise<Seller | null>;
  findById(id: string): Promise<Seller | null>;
  create(data: { email: string; passwordHash: string; name: string }): Promise<Seller>;
  updatePasswordHash(id: string, passwordHash: string): Promise<Seller>;
}

export interface IRefreshTokenRepository {
  create(data: { tokenHash: string; sellerId: string; expiresAt: Date }): Promise<RefreshToken>;
  findActiveByHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string): Promise<RefreshToken>;
  revokeByHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeAllForSeller(sellerId: string): Promise<number>;
}
