import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { productRepository, toProductRecord } from "../repositories/product.repository.js";
import { ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export type OrderLineInput = {
  productId: string;
  name: string;
  unitPriceEtb: number;
  quantity: number;
};

type CatalogProduct = {
  id: string;
  name: string;
  priceEtb: number;
  available: boolean;
  maxQuantity: number;
};

const loadJsonFallback = (): Map<string, CatalogProduct> => {
  try {
    const catalogPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../data/catalog.json");
    const products = JSON.parse(readFileSync(catalogPath, "utf8")) as CatalogProduct[];
    return new Map(products.map((p) => [p.id, p]));
  } catch {
    return new Map();
  }
};

/** Validate order lines against DB catalog (JSON fallback if DB empty/unavailable). */
export async function assertCatalogLines(lines: OrderLineInput[]): Promise<OrderLineInput[]> {
  let byId = new Map<string, CatalogProduct>();

  try {
    const rows = await productRepository.listAllForSeller();
    byId = new Map(
      rows.map((p) => {
        const record = toProductRecord(p);
        return [
          record.id,
          {
            id: record.id,
            name: record.name,
            priceEtb: record.priceEtb,
            available: record.available,
            maxQuantity: record.maxQuantity,
          },
        ];
      }),
    );
  } catch (error) {
    logger.warn("Catalog DB lookup failed; using JSON fallback", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    byId = loadJsonFallback();
  }

  if (byId.size === 0) byId = loadJsonFallback();

  return lines.map((line) => {
    const product = byId.get(line.productId);
    if (!product) {
      throw new ValidationError("Unknown product in order", [`Unknown product: ${line.productId}`]);
    }
    if (!product.available) {
      throw new ValidationError("Product is unavailable", [`Unavailable: ${product.name}`]);
    }
    if (line.quantity < 1 || line.quantity > product.maxQuantity) {
      throw new ValidationError("Invalid quantity", [`Invalid quantity for ${product.name}`]);
    }
    if (line.unitPriceEtb !== product.priceEtb) {
      throw new ValidationError("Price mismatch", [`Price mismatch for ${product.name}`]);
    }
    return {
      productId: product.id,
      name: product.name,
      unitPriceEtb: product.priceEtb,
      quantity: line.quantity,
    };
  });
}
