import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import type {
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  LogoutBody,
  RefreshBody,
  ResetPasswordBody,
} from "../validators/auth.validator.js";
import { sendSuccess } from "../utils/response.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as LoginBody;
  const result = await authService.login(body.email, body.password);
  sendSuccess(res, "Login successful", result);
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as RefreshBody;
  const result = await authService.refresh(body.refreshToken);
  sendSuccess(res, "Token refreshed", result);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as LogoutBody;
  await authService.logout(body.refreshToken, req.seller?.id);
  sendSuccess(res, "Logout successful", {});
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as ForgotPasswordBody;
  const result = await authService.requestPasswordReset(body.email);
  sendSuccess(
    res,
    "If an account exists for that email, a reset link has been sent",
    result,
  );
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as ResetPasswordBody;
  await authService.resetPassword(body.token, body.password);
  sendSuccess(res, "Password updated", {});
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as ChangePasswordBody;
  await authService.changePassword(req.seller!.id, body.currentPassword, body.newPassword);
  sendSuccess(res, "Password changed", {});
};
