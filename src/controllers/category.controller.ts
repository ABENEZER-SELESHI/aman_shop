import type { Request, Response } from "express";
import { categoryService } from "../services/category.service.js";
import type { CategoryBody, CategoryUpdateBody } from "../validators/product.validator.js";
import { sendSuccess } from "../utils/response.js";

export const listPublicCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await categoryService.listPublic();
  sendSuccess(res, "Categories retrieved", categories);
};

export const getPublicCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.getBySlug(String(req.params.slug));
  sendSuccess(res, "Category retrieved", category);
};

export const listSellerCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await categoryService.listSeller();
  sendSuccess(res, "Categories retrieved", categories);
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CategoryBody;
  const category = await categoryService.create(body, req.seller!.id);
  sendSuccess(res, "Category created", category, 201);
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CategoryUpdateBody;
  const category = await categoryService.update(String(req.params.id), body, req.seller!.id);
  sendSuccess(res, "Category updated", category);
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  await categoryService.remove(String(req.params.id), req.seller!.id);
  sendSuccess(res, "Category deleted", {});
};
