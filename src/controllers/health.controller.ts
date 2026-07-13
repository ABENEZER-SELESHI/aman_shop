import type { Request, Response } from "express";
import { prisma } from "../database/prisma.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const health = (_req: Request, res: Response): void => {
  sendSuccess(res, "OK", { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
};

export const live = (_req: Request, res: Response): void => {
  sendSuccess(res, "OK", { status: "alive" });
};

export const ready = async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, "OK", { status: "ready", database: "up" });
  } catch {
    sendError(res, "Service unavailable", ["Database unavailable"], 503);
  }
};
