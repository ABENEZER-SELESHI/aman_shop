import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { activityLogService } from "../services/activityLog.service.js";
import { sendSuccess } from "../utils/response.js";

export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  const data = await dashboardService.getOverview();
  sendSuccess(res, "Dashboard retrieved", data);
};

export const listActivityLogs = async (req: Request, res: Response): Promise<void> => {
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
  const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
  const action = typeof req.query.action === "string" ? req.query.action : undefined;
  const logs = await activityLogService.list({ limit, offset, action });
  sendSuccess(res, "Activity logs retrieved", logs);
};
