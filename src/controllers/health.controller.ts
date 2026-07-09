import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";

export const health = (_req: Request, res: Response): void => {
  sendSuccess(res, "OK", { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
};
