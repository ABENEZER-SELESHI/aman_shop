import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { sellerRepository } from "../repositories/seller.repository.js";

type AccessTokenPayload = jwt.JwtPayload & {
  sub: string;
  email: string;
  name: string;
  type: "access";
};

/** Attach seller when a valid bearer token is present; never blocks anonymous access. */
export const optionalSellerAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
    if (!token) {
      next();
      return;
    }

    const payload = jwt.verify(token, config.jwt.accessSecret, { algorithms: ["HS256"] }) as AccessTokenPayload;
    if (payload.type !== "access" || !payload.sub) {
      next();
      return;
    }

    const seller = await sellerRepository.findById(payload.sub);
    if (seller) {
      req.seller = { id: seller.id, email: seller.email, name: seller.name };
    }
    next();
  } catch {
    next();
  }
};
