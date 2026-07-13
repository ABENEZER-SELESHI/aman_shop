import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { sellerRepository } from "../repositories/seller.repository.js";
import { UnauthorizedError } from "../utils/errors.js";

type AccessTokenPayload = jwt.JwtPayload & {
  sub: string;
  email: string;
  name: string;
  type: "access";
};

export const requireSellerAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;

    if (!token) throw new UnauthorizedError("Missing bearer token");

    const payload = jwt.verify(token, config.jwt.accessSecret, { algorithms: ["HS256"] }) as AccessTokenPayload;
    if (payload.type !== "access" || !payload.sub) throw new UnauthorizedError("Invalid access token");

    const seller = await sellerRepository.findById(payload.sub);
    if (!seller) throw new UnauthorizedError("Seller account is not active");

    req.seller = { id: seller.id, email: seller.email, name: seller.name };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) next(error);
    else next(new UnauthorizedError("Invalid or expired access token"));
  }
};
