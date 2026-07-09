import type { RefreshToken } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import type { IRefreshTokenRepository } from "../interfaces/repositories.js";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: { tokenHash: string; sellerId: string; expiresAt: Date }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  async findActiveByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async revoke(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async revokeByHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!token || token.revokedAt) return token;
    return this.revoke(token.id);
  }

  async revokeAllForSeller(sellerId: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({
      where: { sellerId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
