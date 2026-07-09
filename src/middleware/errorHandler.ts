import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
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

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error("Database request failed", { requestId, code: error.code, message: error.message });
    const message = error.code === "P2025" ? "Resource not found" : "Database request failed";
    const statusCode = error.code === "P2025" ? 404 : 500;
    sendError(res, message, [], statusCode);
    return;
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error("Unhandled application error", { requestId, message });
  sendError(res, "Internal server error", [], 500);
};
