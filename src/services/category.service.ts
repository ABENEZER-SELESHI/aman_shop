import {
  categoryRepository,
  productRepository,
  toCategoryRecord,
  type CategoryRecord,
} from "../repositories/product.repository.js";
import { activityLogService } from "./activityLog.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";

export type CategoryInput = {
  slug?: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

export class CategoryService {
  async listPublic(): Promise<CategoryRecord[]> {
    const rows = await categoryRepository.listPublic();
    return rows.map((row) => toCategoryRecord(row));
  }

  async listSeller(): Promise<CategoryRecord[]> {
    const rows = await categoryRepository.listSeller();
    return rows.map((row) => toCategoryRecord(row, row._count.products));
  }

  async getBySlug(slug: string): Promise<CategoryRecord> {
    const category = await categoryRepository.findBySlug(slug);
    if (!category || !category.isActive) throw new NotFoundError("Category not found");
    return toCategoryRecord(category);
  }

  async create(input: CategoryInput, sellerId: string): Promise<CategoryRecord> {
    const slug = slugify(input.slug || input.name);
    if (!slug) throw new ValidationError("Invalid slug", ["slug is required"]);

    const existing = await categoryRepository.findBySlug(slug);
    if (existing) throw new ConflictError("A category with this slug already exists");

    const created = await categoryRepository.create({
      slug,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    });

    await activityLogService.log({
      actorType: "seller",
      actorId: sellerId,
      action: "category.created",
      entity: "category",
      entityId: created.id,
      message: `Created category ${created.name}`,
    });

    return toCategoryRecord(created, 0);
  }

  async update(id: string, input: Partial<CategoryInput>, sellerId: string): Promise<CategoryRecord> {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");

    if (input.slug && input.slug !== existing.slug) {
      const slug = slugify(input.slug);
      const clash = await categoryRepository.findBySlug(slug);
      if (clash && clash.id !== id) throw new ConflictError("A category with this slug already exists");
      input.slug = slug;
    }

    const updated = await categoryRepository.update(id, {
      slug: input.slug,
      name: input.name?.trim(),
      description: input.description?.trim(),
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    });

    await activityLogService.log({
      actorType: "seller",
      actorId: sellerId,
      action: "category.updated",
      entity: "category",
      entityId: id,
      message: `Updated category ${updated.name}`,
    });

    return toCategoryRecord(updated);
  }

  async remove(id: string, sellerId: string): Promise<void> {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");

    const count = await productRepository.countByCategory(id);
    if (count > 0) {
      throw new ValidationError("Category still has products", [
        `Move or delete ${count} product(s) before removing this category`,
      ]);
    }

    await categoryRepository.update(id, { deletedAt: new Date(), isActive: false });
    await activityLogService.log({
      actorType: "seller",
      actorId: sellerId,
      action: "category.deleted",
      entity: "category",
      entityId: id,
      message: `Deleted category ${existing.name}`,
    });
  }
}

export const categoryService = new CategoryService();
