import type { Seller } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import type { ISellerRepository } from "../interfaces/repositories.js";

export class SellerRepository implements ISellerRepository {
  async findByEmail(email: string): Promise<Seller | null> {
    return prisma.seller.findFirst({ where: { email: email.toLowerCase(), deletedAt: null } });
  }

  async findById(id: string): Promise<Seller | null> {
    return prisma.seller.findFirst({ where: { id, deletedAt: null } });
  }

  async create(data: { email: string; passwordHash: string; name: string }): Promise<Seller> {
    return prisma.seller.create({ data: { ...data, email: data.email.toLowerCase() } });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<Seller> {
    return prisma.seller.update({ where: { id }, data: { passwordHash } });
  }
}

export const sellerRepository = new SellerRepository();
