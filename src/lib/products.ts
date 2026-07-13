import productsData from "../../content/products.json";
import { siteConfig } from "@/lib/config";
import type { ApiSuccess, Category, Product, ProductCategory } from "@/types";

const localProducts = productsData as Product[];

function filterProducts(
  source: Product[],
  filter?: {
    category?: ProductCategory;
    featuredOnly?: boolean;
  },
): Product[] {
  let result = [...source];
  if (filter?.category) {
    result = result.filter((p) => p.category === filter.category);
  }
  if (filter?.featuredOnly) {
    result = result.filter((p) => p.featured);
  }
  return result;
}

/** Sync catalog from bundled JSON (tests, build fallback). */
export function getLocalProducts(filter?: {
  category?: ProductCategory;
  featuredOnly?: boolean;
}): Product[] {
  return filterProducts(localProducts, filter);
}

export function getLocalProductBySlug(slug: string): Product | null {
  return localProducts.find((p) => p.slug === slug) ?? null;
}

export function getLocalProductById(id: string): Product | null {
  return localProducts.find((p) => p.id === id) ?? null;
}

export function getLocalCategories(): Category[] {
  const map = new Map<string, Category>();
  for (const product of localProducts) {
    if (!map.has(product.category)) {
      map.set(product.category, {
        id: product.category,
        slug: product.category,
        name: product.categoryName ?? product.category,
        description: "",
        sortOrder: map.size + 1,
        isActive: true,
      });
    }
  }
  return [...map.values()];
}

async function fetchCatalogFromApi(filter?: {
  category?: ProductCategory;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  const url = new URL(`${siteConfig.apiBaseUrl}/products`);
  if (filter?.category) url.searchParams.set("category", filter.category);
  if (filter?.featuredOnly) url.searchParams.set("featured", "true");

  const response = await fetch(url.toString(), {
    next: { revalidate: 15 },
  });
  if (!response.ok) {
    throw new Error(`Catalog API ${response.status}`);
  }
  const body = (await response.json()) as ApiSuccess<Product[]>;
  return body.data;
}

async function fetchProductBySlugFromApi(slug: string): Promise<Product> {
  const response = await fetch(`${siteConfig.apiBaseUrl}/products/${encodeURIComponent(slug)}`, {
    next: { revalidate: 15 },
  });
  if (!response.ok) {
    throw new Error(`Product API ${response.status}`);
  }
  const body = (await response.json()) as ApiSuccess<Product>;
  return body.data;
}

async function fetchCategoriesFromApi(): Promise<Category[]> {
  const response = await fetch(`${siteConfig.apiBaseUrl}/categories`, {
    next: { revalidate: 30 },
  });
  if (!response.ok) {
    throw new Error(`Categories API ${response.status}`);
  }
  const body = (await response.json()) as ApiSuccess<Category[]>;
  return body.data;
}

async function fetchCategoryBySlugFromApi(slug: string): Promise<Category> {
  const response = await fetch(`${siteConfig.apiBaseUrl}/categories/${encodeURIComponent(slug)}`, {
    next: { revalidate: 30 },
  });
  if (!response.ok) {
    throw new Error(`Category API ${response.status}`);
  }
  const body = (await response.json()) as ApiSuccess<Category>;
  return body.data;
}

/** Live catalog from API with JSON fallback when the API is unreachable. */
export async function getProducts(filter?: {
  category?: ProductCategory;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  try {
    return await fetchCatalogFromApi(filter);
  } catch {
    return getLocalProducts(filter);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await fetchProductBySlugFromApi(slug);
  } catch {
    return getLocalProductBySlug(slug);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await fetchCategoriesFromApi();
  } catch {
    return getLocalCategories();
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    return await fetchCategoryBySlugFromApi(slug);
  } catch {
    return getLocalCategories().find((c) => c.slug === slug) ?? null;
  }
}

/** Bundled-JSON lookup only. Client cart code should use useCatalogMap(). */
export function getProductById(id: string): Product | null {
  return getLocalProductById(id);
}
