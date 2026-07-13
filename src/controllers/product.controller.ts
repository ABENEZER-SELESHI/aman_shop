import type { Request, Response } from "express";
import { productService } from "../services/product.service.js";
import type { ProductBody, ProductUpdateBody } from "../validators/product.validator.js";
import { sendSuccess } from "../utils/response.js";

export const listPublicProducts = async (req: Request, res: Response): Promise<void> => {
  const categorySlug = typeof req.query.category === "string" ? req.query.category : undefined;
  const featuredOnly = req.query.featured === "true";
  const products = await productService.listPublic({
    categorySlug,
    featuredOnly: featuredOnly || undefined,
  });
  sendSuccess(res, "Products retrieved", products);
};

export const getPublicProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.getBySlug(String(req.params.slug));
  sendSuccess(res, "Product retrieved", product);
};

export const listSellerProducts = async (_req: Request, res: Response): Promise<void> => {
  const products = await productService.listSeller();
  sendSuccess(res, "Products retrieved", products);
};

export const getSellerProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.getById(String(req.params.id));
  sendSuccess(res, "Product retrieved", product);
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as ProductBody;
  const product = await productService.create(
    { ...body, categorySlug: body.category },
    req.seller!.id,
  );
  sendSuccess(res, "Product created", product, 201);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as ProductUpdateBody;
  const product = await productService.update(
    String(req.params.id),
    {
      ...body,
      categorySlug: body.category,
    },
    req.seller!.id,
  );
  sendSuccess(res, "Product updated", product);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  await productService.remove(String(req.params.id), req.seller!.id);
  sendSuccess(res, "Product deleted", {});
};
