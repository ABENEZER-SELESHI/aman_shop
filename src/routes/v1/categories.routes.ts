import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getPublicCategory,
  listPublicCategories,
  listSellerCategories,
  updateCategory,
} from "../../controllers/category.controller.js";
import { requireSellerAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { categoryBodySchema, categoryUpdateSchema } from "../../validators/product.validator.js";

export const categoriesRouter = Router();
categoriesRouter.get("/", asyncHandler(listPublicCategories));
categoriesRouter.get("/:slug", asyncHandler(getPublicCategory));

export const sellerCategoriesRouter = Router();
sellerCategoriesRouter.use(asyncHandler(requireSellerAuth));
sellerCategoriesRouter.get("/", asyncHandler(listSellerCategories));
sellerCategoriesRouter.post("/", validateBody(categoryBodySchema), asyncHandler(createCategory));
sellerCategoriesRouter.patch("/:id", validateBody(categoryUpdateSchema), asyncHandler(updateCategory));
sellerCategoriesRouter.delete("/:id", asyncHandler(deleteCategory));
