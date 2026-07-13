import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { Seller } from "@prisma/client";
import { config } from "../config/index.js";
import type { IRefreshTokenRepository, ISellerRepository } from "../interfaces/repositories.js";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { passwordResetTokenRepository } from "../repositories/passwordReset.repository.js";
import { sellerRepository } from "../repositories/seller.repository.js";
import { emailService } from "./email.service.js";
import { UnauthorizedError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  seller: { id: string; email: string; name: string };
};

type AccessPayload = jwt.JwtPayload & { sub: string; type: "access"; email: string; name: string };
type RefreshPayload = jwt.JwtPayload & { sub: string; type: "refresh" };

const JWT_OPTS = { algorithms: ["HS256"] as jwt.Algorithm[] };

const parseExpiry = (value: string): Date => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const amount = Number(match[1]);
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;
  return new Date(Date.now() + amount * multipliers[match[2] as keyof typeof multipliers]);
};

export class AuthService {
  constructor(
    private readonly sellers: ISellerRepository = sellerRepository,
    private readonly refreshTokens: IRefreshTokenRepository = refreshTokenRepository,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const seller = await this.sellers.findByEmail(email);
    if (!seller) throw new UnauthorizedError("Invalid email or password");

    const valid = await bcrypt.compare(password, seller.passwordHash);
    if (!valid) {
      logger.warn("Authentication failure", { email: email.toLowerCase() });
      throw new UnauthorizedError("Invalid email or password");
    }

    return this.issueTokenPair(seller);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: RefreshPayload;
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret, JWT_OPTS) as RefreshPayload;
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }
    if (payload.type !== "refresh" || !payload.sub) throw new UnauthorizedError("Invalid refresh token");

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.refreshTokens.findActiveByHash(tokenHash);
    if (!stored || stored.sellerId !== payload.sub) {
      // Possible reuse of rotated token — revoke all sessions for this seller
      await this.refreshTokens.revokeAllForSeller(payload.sub);
      throw new UnauthorizedError("Refresh token has expired or been revoked");
    }

    const seller = await this.sellers.findById(payload.sub);
    if (!seller) throw new UnauthorizedError("Seller account is not active");

    await this.refreshTokens.revoke(stored.id);
    return this.issueTokenPair(seller);
  }

  async logout(refreshToken?: string, sellerId?: string): Promise<void> {
    if (refreshToken) {
      await this.refreshTokens.revokeByHash(this.hashToken(refreshToken));
      return;
    }
    if (sellerId) await this.refreshTokens.revokeAllForSeller(sellerId);
  }

  /**
   * Always returns a generic success path to the caller (no email enumeration).
   * Raw token is returned only in non-production for local testing when email is skipped.
   */
  async requestPasswordReset(email: string): Promise<{ resetToken?: string }> {
    const seller = await this.sellers.findByEmail(email);
    if (!seller) return {};

    await passwordResetTokenRepository.revokeAllForSeller(seller.id);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await passwordResetTokenRepository.create({
      tokenHash,
      sellerId: seller.id,
      expiresAt,
    });

    try {
      await emailService.sendPasswordResetEmail({
        to: seller.email,
        name: seller.name,
        resetToken: rawToken,
        expiresMinutes: 15,
      });
    } catch (error) {
      logger.error("Password reset email failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }

    if (config.isDevelopment || config.isTest) {
      return { resetToken: rawToken };
    }
    return {};
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const stored = await passwordResetTokenRepository.findActiveByHash(tokenHash);
    if (!stored) throw new ValidationError("Invalid or expired reset token", ["Invalid reset token"]);

    const passwordHash = await this.hashPassword(newPassword);
    await this.sellers.updatePasswordHash(stored.sellerId, passwordHash);
    await passwordResetTokenRepository.markUsed(stored.id);
    await passwordResetTokenRepository.revokeAllForSeller(stored.sellerId);
    await this.refreshTokens.revokeAllForSeller(stored.sellerId);
  }

  async changePassword(sellerId: string, currentPassword: string, newPassword: string): Promise<void> {
    const seller = await this.sellers.findById(sellerId);
    if (!seller) throw new UnauthorizedError("Seller account is not active");

    const valid = await bcrypt.compare(currentPassword, seller.passwordHash);
    if (!valid) throw new UnauthorizedError("Current password is incorrect");

    const passwordHash = await this.hashPassword(newPassword);
    await this.sellers.updatePasswordHash(seller.id, passwordHash);
    await this.refreshTokens.revokeAllForSeller(seller.id);
  }

  private async issueTokenPair(seller: Seller): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { email: seller.email, name: seller.name, type: "access" },
      config.jwt.accessSecret,
      {
        algorithm: "HS256",
        subject: seller.id,
        expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"],
      },
    );

    const refreshToken = jwt.sign({ type: "refresh" }, config.jwt.refreshSecret, {
      algorithm: "HS256",
      subject: seller.id,
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
    });

    await this.refreshTokens.create({
      tokenHash: this.hashToken(refreshToken),
      sellerId: seller.id,
      expiresAt: parseExpiry(config.jwt.refreshExpiresIn),
    });

    return {
      accessToken,
      refreshToken,
      seller: { id: seller.id, email: seller.email, name: seller.name },
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

export const authService = new AuthService();
export type { AccessPayload };
