import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../src/config/index.js";
import { prisma } from "../src/database/prisma.js";

type SeedProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
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

const DEFAULT_CATEGORIES = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    slug: "vases",
    name: "Vases",
    description: "Handmade flower vases and vessels.",
    sortOrder: 1,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    slug: "baskets",
    name: "Baskets",
    description: "Woven baskets for storage and everyday use.",
    sortOrder: 2,
  },
] as const;

const main = async () => {
  const { email, password, name } = config.seedSeller;

  if (!email || !password || !name) {
    throw new Error("SELLER_EMAIL, SELLER_PASSWORD, and SELLER_NAME are required for seeding");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.seller.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, name, deletedAt: null },
    create: { email: email.toLowerCase(), passwordHash, name },
  });

  console.log(`Seeded seller ${email}`);

  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
        deletedAt: null,
      },
      create: { ...category, isActive: true },
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);

  const categories = await prisma.category.findMany({ where: { deletedAt: null } });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const catalogPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/data/catalog.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as SeedProduct[];

  for (const item of catalog) {
    const categoryId = categoryBySlug.get(item.category);
    if (!categoryId) {
      throw new Error(`Unknown category slug in catalog: ${item.category}`);
    }

    await prisma.product.upsert({
      where: { id: item.id },
      update: {
        slug: item.slug,
        name: item.name,
        categoryId,
        priceEtb: item.priceEtb,
        description: item.description,
        materials: item.materials,
        dimensions: item.dimensions,
        care: item.care,
        images: item.images,
        featured: item.featured,
        available: item.available,
        maxQuantity: item.maxQuantity,
        deletedAt: null,
      },
      create: {
        id: item.id,
        slug: item.slug,
        name: item.name,
        categoryId,
        priceEtb: item.priceEtb,
        description: item.description,
        materials: item.materials,
        dimensions: item.dimensions,
        care: item.care,
        images: item.images,
        featured: item.featured,
        available: item.available,
        maxQuantity: item.maxQuantity,
      },
    });
  }

  console.log(`Seeded ${catalog.length} products`);
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
