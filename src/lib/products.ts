import productsData from "../../content/products.json";
import type { Product, ProductCategory } from "@/types";

const products = productsData as Product[];

export function getProducts(filter?: {
  category?: ProductCategory;
  featuredOnly?: boolean;
}): Product[] {
  let result = [...products];
  if (filter?.category) {
    result = result.filter((p) => p.category === filter.category);
  }
  if (filter?.featuredOnly) {
    result = result.filter((p) => p.featured);
  }
  return result;
}

export function getProductBySlug(slug: string): Product | null {
  return products.find((p) => p.slug === slug) ?? null;
}

export function getProductById(id: string): Product | null {
  return products.find((p) => p.id === id) ?? null;
}
