import {
  categoryRepository,
  productRepository,
  toProductRecord,
  type ProductRecord,
} from "../repositories/product.repository.js";
import { activityLogService } from "./activityLog.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";

export type ProductInput = {
  id?: string;
  slug: string;
  name: string;
  categorySlug: string;
  priceEtb: number;
  description: string;
  materials: string;
  dimensions: string;
  care: string;
  images: string[];
  featured: boolean;
  available: boolean;
  maxQuantity: number;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

async function resolveCategoryId(categorySlug: string): Promise<string> {
  const category = await categoryRepository.findBySlug(categorySlug);
  if (!category || !category.isActive) {
    throw new ValidationError("Invalid category", [`Unknown or inactive category: ${categorySlug}`]);
  }
  return category.id;
}

export class ProductService {
  async listPublic(filter?: { categorySlug?: string; featuredOnly?: boolean }): Promise<ProductRecord[]> {
    const rows = await productRepository.list({
      categorySlug: filter?.categorySlug,
      featuredOnly: filter?.featuredOnly,
      includeUnavailable: true,
    });
    return rows.map(toProductRecord);
  }

  async listSeller(): Promise<ProductRecord[]> {
    const rows = await productRepository.listAllForSeller();
    return rows.map(toProductRecord);
  }

  async getBySlug(slug: string): Promise<ProductRecord> {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new NotFoundError("Product not found");
    return toProductRecord(product);
  }

  async getById(id: string): Promise<ProductRecord> {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return toProductRecord(product);
  }

  async create(input: ProductInput, sellerId: string): Promise<ProductRecord> {
    const slug = input.slug || slugify(input.name);
    if (!slug) throw new ValidationError("Invalid slug", ["slug is required"]);

    const existingSlug = await productRepository.findBySlug(slug);
    if (existingSlug) throw new ConflictError("A product with this slug already exists");

    const categoryId = await resolveCategoryId(input.categorySlug);
    const id = input.id?.trim() || `${input.categorySlug}-${slug}`.slice(0, 120);
    const existingId = await productRepository.findById(id);
    if (existingId) throw new ConflictError("A product with this id already exists");

    const created = await productRepository.create({
      id,
      slug,
      name: input.name,
      categoryId,
      priceEtb: input.priceEtb,
      description: input.description,
      materials: input.materials,
      dimensions: input.dimensions,
      care: input.care,
      images: input.images,
      featured: input.featured,
      available: input.available,
      maxQuantity: input.maxQuantity,
    });

    await activityLogService.log({
      actorType: "seller",
      actorId: sellerId,
      action: "product.created",
      entity: "product",
      entityId: created.id,
      message: `Created product ${created.name}`,
    });

    return toProductRecord(created);
  }

  async update(id: string, input: Partial<ProductInput>, sellerId: string): Promise<ProductRecord> {
    const existing = await productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    if (input.slug && input.slug !== existing.slug) {
      const clash = await productRepository.findBySlug(input.slug);
      if (clash && clash.id !== id) throw new ConflictError("A product with this slug already exists");
    }

    const categoryId = input.categorySlug
      ? await resolveCategoryId(input.categorySlug)
      : undefined;

    const updated = await productRepository.update(id, {
      slug: input.slug,
      name: input.name,
      categoryId,
      priceEtb: input.priceEtb,
      description: input.description,
      materials: input.materials,
      dimensions: input.dimensions,
      care: input.care,
      images: input.images,
      featured: input.featured,
      available: input.available,
      maxQuantity: input.maxQuantity,
    });

    await activityLogService.log({
      actorType: "seller",
      actorId: sellerId,
      action: "product.updated",
      entity: "product",
      entityId: id,
      message: `Updated product ${updated.name}`,
    });

    return toProductRecord(updated);
  }

  async remove(id: string, sellerId: string): Promise<void> {
    const existing = await productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    await productRepository.softDelete(id);
    await activityLogService.log({
      actorType: "seller",
      actorId: sellerId,
      action: "product.deleted",
      entity: "product",
      entityId: id,
      message: `Deleted product ${existing.name}`,
    });
  }
}

export const productService = new ProductService();
