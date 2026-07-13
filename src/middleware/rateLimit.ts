import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";

const buildHandler = (message: string) => (_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }) => {
  res.status(429).json({ success: false, message, errors: [message] });
};

export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => {
    const path = req.path;
    return path === "/api/v1/live" || path === "/api/v1/ready" || path === "/api/v1/health" || path === "/live" || path === "/ready" || path === "/health";
  },
  handler: buildHandler("Too many requests"),
});

export const orderRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.orderMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: buildHandler("Too many order requests"),
});

/** ~5 login/refresh attempts per minute per IP */
export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: buildHandler("Too many authentication attempts"),
});

/** 3 password-reset related requests per hour per IP */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: buildHandler("Too many password reset attempts"),
});
