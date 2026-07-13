import { z } from "zod";

const categorySlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

export const productBodySchema = z.object({
  id: z.string().trim().min(1).max(120).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  name: z.string().trim().min(2).max(200),
  category: categorySlugSchema,
  priceEtb: z.number().int().positive().max(10_000_000),
  description: z.string().trim().min(10).max(5000),
  materials: z.string().trim().min(1).max(500),
  dimensions: z.string().trim().min(1).max(200),
  care: z.string().trim().min(1).max(500),
  images: z.array(z.string().trim().min(1).max(500)).min(1).max(12),
  featured: z.boolean().default(false),
  available: z.boolean().default(true),
  maxQuantity: z.number().int().positive().max(100).default(10),
});

export const productUpdateSchema = productBodySchema.partial().extend({
  slug: productBodySchema.shape.slug.optional(),
});

export const publicProductsQuerySchema = z.object({
  category: categorySlugSchema.optional(),
  featured: z.enum(["true", "false"]).optional(),
});

export const categoryBodySchema = z.object({
  slug: categorySlugSchema.optional(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryBodySchema.partial().extend({
  name: z.string().trim().min(2).max(80).optional(),
});

export type ProductBody = z.infer<typeof productBodySchema>;
export type ProductUpdateBody = z.infer<typeof productUpdateSchema>;
export type CategoryBody = z.infer<typeof categoryBodySchema>;
export type CategoryUpdateBody = z.infer<typeof categoryUpdateSchema>;
