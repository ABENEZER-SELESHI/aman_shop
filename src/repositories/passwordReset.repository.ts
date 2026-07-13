import type { PasswordResetToken } from "@prisma/client";
import { prisma } from "../database/prisma.js";

export class PasswordResetTokenRepository {
  async create(data: { tokenHash: string; sellerId: string; expiresAt: Date }): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({ data });
  }

  async findActiveByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async markUsed(id: string): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  }

  async revokeAllForSeller(sellerId: string): Promise<number> {
    const result = await prisma.passwordResetToken.updateMany({
      where: { sellerId, usedAt: null },
      data: { usedAt: new Date() },
    });
    return result.count;
  }
}

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
