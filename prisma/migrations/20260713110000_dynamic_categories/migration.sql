-- Create categories table and migrate products off product_category enum

CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");
CREATE INDEX "categories_sort_order_idx" ON "categories"("sort_order");

-- Seed default categories (stable UUIDs for migration)
INSERT INTO "categories" ("id", "slug", "name", "description", "sort_order", "is_active", "created_at", "updated_at")
VALUES
  ('11111111-1111-1111-1111-111111111101', 'vases', 'Vases', 'Handmade flower vases and vessels.', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('11111111-1111-1111-1111-111111111102', 'baskets', 'Baskets', 'Woven baskets for storage and everyday use.', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add nullable category_id, backfill from old enum, then enforce NOT NULL
ALTER TABLE "products" ADD COLUMN "category_id" UUID;

UPDATE "products"
SET "category_id" = CASE
  WHEN "category"::text = 'vase' THEN '11111111-1111-1111-1111-111111111101'::uuid
  WHEN "category"::text = 'basket' THEN '11111111-1111-1111-1111-111111111102'::uuid
  ELSE '11111111-1111-1111-1111-111111111101'::uuid
END;

ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;

DROP INDEX IF EXISTS "products_category_idx";
ALTER TABLE "products" DROP COLUMN "category";
DROP TYPE IF EXISTS "product_category";

CREATE INDEX "products_category_id_idx" ON "products"("category_id");

ALTER TABLE "products"
  ADD CONSTRAINT "products_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
