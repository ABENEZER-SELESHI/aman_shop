import { Router } from "express";
import { getDashboard, listActivityLogs } from "../../controllers/studio.controller.js";
import { requireSellerAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const studioRouter = Router();

studioRouter.use(asyncHandler(requireSellerAuth));
studioRouter.get("/dashboard", asyncHandler(getDashboard));
studioRouter.get("/logs", asyncHandler(listActivityLogs));
