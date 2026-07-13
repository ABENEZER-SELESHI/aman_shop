import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { sendError } from "../utils/response.js";

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
  const requestId = req.requestId;

  if (error instanceof AppError) {
    logger.warn(error.message, { requestId, statusCode: error.statusCode, errors: error.errors });
    sendError(res, error.message, error.errors, error.statusCode);
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image is too large (max 5MB)"
        : error.code === "LIMIT_FILE_COUNT"
          ? "Too many images (max 8 at once)"
          : "Image upload failed";
    logger.warn(message, { requestId, code: error.code });
    sendError(res, message, [error.message], 400);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error("Database request failed", { requestId, code: error.code, message: error.message });
    const message = error.code === "P2025" ? "Resource not found" : "Database request failed";
    const statusCode = error.code === "P2025" ? 404 : 500;
    sendError(res, message, [], statusCode);
    return;
  }

  // Multer fileFilter sometimes forwards ValidationError-like Errors
  if (error instanceof Error && error.message.includes("Only JPEG")) {
    sendError(res, error.message, ["Invalid image type"], 400);
    return;
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error("Unhandled application error", { requestId, message });
  sendError(res, "Internal server error", [], 500);
};

