import { Router } from "express";
import { uploadProductImages } from "../../controllers/upload.controller.js";
import { requireSellerAuth } from "../../middleware/auth.js";
import { productImageUpload } from "../../middleware/upload.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const uploadsRouter = Router();

uploadsRouter.use(asyncHandler(requireSellerAuth));
uploadsRouter.post(
  "/",
  productImageUpload.array("images", 8),
  asyncHandler(uploadProductImages),
);
