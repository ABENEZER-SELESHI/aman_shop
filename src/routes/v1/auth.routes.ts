import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  refresh,
  resetPassword,
} from "../../controllers/auth.controller.js";
import { requireSellerAuth } from "../../middleware/auth.js";
import { authRateLimiter, passwordResetRateLimiter } from "../../middleware/rateLimit.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  resetPasswordSchema,
} from "../../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post("/login", authRateLimiter, validateBody(loginSchema), asyncHandler(login));
authRouter.post("/refresh", authRateLimiter, validateBody(refreshSchema), asyncHandler(refresh));
authRouter.post("/logout", authRateLimiter, validateBody(logoutSchema), asyncHandler(logout));
authRouter.post(
  "/forgot-password",
  passwordResetRateLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);
authRouter.post(
  "/reset-password",
  passwordResetRateLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(resetPassword),
);
authRouter.post(
  "/change-password",
  asyncHandler(requireSellerAuth),
  validateBody(changePasswordSchema),
  asyncHandler(changePassword),
);
