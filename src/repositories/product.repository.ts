import type { Category, Product, Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.js";

export type CategoryRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  categoryId: string;
  priceEtb: number;
  description: string;
  materials: string;
  dimensions: string;
  care: string;
  images: string[];
  featured: boolean;
  available: boolean;
  maxQuantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductCreateData = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
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

type ProductWithCategory = Product & { category: Category };

export const toCategoryRecord = (
  category: Category,
  productCount?: number,
): CategoryRecord => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  description: category.description,
  sortOrder: category.sortOrder,
  isActive: category.isActive,
  productCount,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export const toProductRecord = (product: ProductWithCategory): ProductRecord => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  category: product.category.slug,
  categoryName: product.category.name,
  categoryId: product.categoryId,
  priceEtb: product.priceEtb,
  description: product.description,
  materials: product.materials,
  dimensions: product.dimensions,
  care: product.care,
  images: Array.isArray(product.images) ? (product.images as string[]) : [],
  featured: product.featured,
  available: product.available,
  maxQuantity: product.maxQuantity,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const productInclude = { category: true } as const;

export class ProductRepository {
  async list(filters: {
    categorySlug?: string;
    featuredOnly?: boolean;
    includeUnavailable?: boolean;
    includeDeleted?: boolean;
  } = {}): Promise<ProductWithCategory[]> {
    return prisma.product.findMany({
      where: {
        deletedAt: filters.includeDeleted ? undefined : null,
        featured: filters.featuredOnly ? true : undefined,
        available: filters.includeUnavailable ? undefined : true,
        category: filters.categorySlug
          ? { slug: filters.categorySlug, deletedAt: null }
          : undefined,
      },
      include: productInclude,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
  }

  async listAllForSeller(): Promise<ProductWithCategory[]> {
    return prisma.product.findMany({
      where: { deletedAt: null },
      include: productInclude,
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
  }

  async findBySlug(slug: string): Promise<ProductWithCategory | null> {
    return prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: productInclude,
    });
  }

  async create(data: ProductCreateData): Promise<ProductWithCategory> {
    return prisma.product.create({
      data: {
        ...data,
        images: data.images as Prisma.InputJsonValue,
      },
      include: productInclude,
    });
  }

  async update(
    id: string,
    data: Partial<Omit<ProductCreateData, "id">> & { deletedAt?: Date | null },
  ): Promise<ProductWithCategory> {
    const { images, ...rest } = data;
    return prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(images !== undefined ? { images: images as Prisma.InputJsonValue } : {}),
      },
      include: productInclude,
    });
  }

  async softDelete(id: string): Promise<ProductWithCategory> {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), available: false },
      include: productInclude,
    });
  }

  async countByCategory(categoryId: string): Promise<number> {
    return prisma.product.count({
      where: { categoryId, deletedAt: null },
    });
  }
}

export class CategoryRepository {
  async listPublic(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async listSeller(): Promise<(Category & { _count: { products: number } })[]> {
    return prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { id, deletedAt: null } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { slug, deletedAt: null } });
  }

  async create(data: {
    slug: string;
    name: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<Category> {
    return prisma.category.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description ?? "",
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      slug: string;
      name: string;
      description: string;
      sortOrder: number;
      isActive: boolean;
      deletedAt: Date | null;
    }>,
  ): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }
}

export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
