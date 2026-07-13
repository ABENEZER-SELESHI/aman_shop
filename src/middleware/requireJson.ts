import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../utils/errors.js";

const MUTATING = new Set(["POST", "PUT", "PATCH"]);

/** Reject mutating requests without JSON content type. */
export const requireJsonContentType = (req: Request, _res: Response, next: NextFunction): void => {
  if (!MUTATING.has(req.method)) {
    next();
    return;
  }

  const contentType = req.header("content-type") ?? "";
  const lower = contentType.toLowerCase();
  // Multipart uploads (product images) are exempt from JSON requirement
  if (lower.includes("multipart/form-data")) {
    next();
    return;
  }
  if (!lower.includes("application/json")) {
    next(new ValidationError("Content-Type must be application/json", ["Invalid Content-Type"]));
    return;
  }
  next();
};
