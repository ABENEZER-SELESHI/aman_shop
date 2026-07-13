import type { Request, Response } from "express";
import { ValidationError } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";
import { activityLogService } from "../services/activityLog.service.js";

export const uploadProductImages = async (req: Request, res: Response): Promise<void> => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw new ValidationError("No images uploaded", ["Select at least one image file"]);
  }

  const urls = files.map((file) => `/uploads/products/${file.filename}`);
  const sellerId = req.seller?.id;

  if (sellerId) {
    await activityLogService.log({
      actorType: "seller",
      actorId: sellerId,
      action: "product.images_uploaded",
      entity: "product",
      message: `Uploaded ${urls.length} product image(s)`,
      metadata: { urls },
    });
  }

  sendSuccess(res, "Images uploaded", { urls }, 201);
};
