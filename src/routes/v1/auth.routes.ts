import { Router } from "express";
import { login, logout, refresh } from "../../controllers/auth.controller.js";
import { authRateLimiter } from "../../middleware/rateLimit.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { loginSchema, logoutSchema, refreshSchema } from "../../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post("/login", authRateLimiter, validateBody(loginSchema), asyncHandler(login));
authRouter.post("/refresh", authRateLimiter, validateBody(refreshSchema), asyncHandler(refresh));
authRouter.post("/logout", validateBody(logoutSchema), asyncHandler(logout));
