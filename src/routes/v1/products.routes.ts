import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getPublicProductBySlug,
  getSellerProduct,
  listPublicProducts,
  listSellerProducts,
  updateProduct,
} from "../../controllers/product.controller.js";
import { requireSellerAuth } from "../../middleware/auth.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  productBodySchema,
  productUpdateSchema,
  publicProductsQuerySchema,
} from "../../validators/product.validator.js";

export const productsRouter = Router();

productsRouter.get("/", validateQuery(publicProductsQuerySchema), asyncHandler(listPublicProducts));
productsRouter.get("/:slug", asyncHandler(getPublicProductBySlug));

export const sellerProductsRouter = Router();
sellerProductsRouter.use(asyncHandler(requireSellerAuth));
sellerProductsRouter.get("/", asyncHandler(listSellerProducts));
sellerProductsRouter.get("/:id", asyncHandler(getSellerProduct));
sellerProductsRouter.post("/", validateBody(productBodySchema), asyncHandler(createProduct));
sellerProductsRouter.patch("/:id", validateBody(productUpdateSchema), asyncHandler(updateProduct));
sellerProductsRouter.delete("/:id", asyncHandler(deleteProduct));
