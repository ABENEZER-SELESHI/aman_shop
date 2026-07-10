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
  handler: buildHandler("Too many requests"),
});

export const orderRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.orderMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: buildHandler("Too many order requests"),
});

export const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: buildHandler("Too many authentication attempts"),
});
