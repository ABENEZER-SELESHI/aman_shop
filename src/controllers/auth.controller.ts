import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import type { LoginBody, LogoutBody, RefreshBody } from "../validators/auth.validator.js";
import { sendSuccess } from "../utils/response.js";

export const login = async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
  const result = await authService.login(req.body.email, req.body.password);
  sendSuccess(res, "Login successful", result);
};

export const refresh = async (req: Request<object, object, RefreshBody>, res: Response): Promise<void> => {
  const result = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, "Token refreshed", result);
};

export const logout = async (req: Request<object, object, LogoutBody>, res: Response): Promise<void> => {
  await authService.logout(req.body.refreshToken, req.seller?.id);
  sendSuccess(res, "Logout successful", {});
};
