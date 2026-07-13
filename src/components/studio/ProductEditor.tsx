"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSellerProduct,
  fetchSellerCategories,
  fetchSellerProduct,
  updateSellerProduct,
  uploadSellerProductImages,
  type StudioProductInput,
} from "@/services/studio";
import { resolveMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import type { Category } from "@/types";

const schema = z.object({
  id: z.string().trim().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case"),
  name: z.string().trim().min(2),
  category: z.string().trim().min(1, "Select a category"),
  priceEtb: z.number().int().positive(),
  description: z.string().trim().min(10),
  materials: z.string().trim().min(1),
  dimensions: z.string().trim().min(1),
  care: z.string().trim().min(1),
  images: z.array(z.string().trim().min(1)).min(1, "Add at least one product image").max(12),
  featured: z.boolean(),
  available: z.boolean(),
  maxQuantity: z.number().int().positive().max(100),
});

type FormValues = z.infer<typeof schema>;

const emptyDefaults: FormValues = {
  id: "",
  slug: "",
  name: "",
  category: "",
  priceEtb: 1000,
  description: "",
  materials: "",
  dimensions: "",
  care: "",
  images: [],
  featured: false,
  available: true,
  maxQuantity: 10,
};

function toPayload(values: FormValues): StudioProductInput {
  return {
    id: values.id?.trim() || undefined,
    slug: values.slug,
    name: values.name,
    category: values.category,
    priceEtb: values.priceEtb,
    description: values.description,
    materials: values.materials,
    dimensions: values.dimensions,
    care: values.care,
    images: values.images,
    featured: values.featured,
    available: values.available,
    maxQuantity: values.maxQuantity,
  };
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(productId);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  const images = watch("images");
  const available = watch("available");
  const featured = watch("featured");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchSellerCategories();
        if (cancelled) return;
        const active = list.filter((c) => c.isActive);
        setCategories(active);
        if (!productId && active[0] && !watch("category")) {
          setValue("category", active[0].slug);
        }
      } catch (error) {
        toast(error instanceof Error ? error.message : "Could not load categories", "error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, setValue, toast]);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    (async () => {
      try {
        const product = await fetchSellerProduct(productId);
        if (cancelled) return;
        reset({
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          priceEtb: product.priceEtb,
          description: product.description,
          materials: product.materials,
          dimensions: product.dimensions,
          care: product.care,
          images: product.images,
          featured: product.featured,
          available: product.available,
          maxQuantity: product.maxQuantity,
        });
      } catch (error) {
        toast(error instanceof Error ? error.message : "Could not load product", "error");
        router.replace("/studio/products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, reset, router, toast]);

  async function onPickFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const remaining = 12 - images.length;
    if (remaining <= 0) {
      toast("Maximum of 12 images per product", "error");
      return;
    }
    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);
    try {
      const urls = await uploadSellerProductImages(files);
      setValue("images", [...images, ...urls], { shouldValidate: true, shouldDirty: true });
      toast(urls.length === 1 ? "Image uploaded" : `${urls.length} images uploaded`, "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setValue(
      "images",
      images.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  }

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/studio/products" className="text-sm text-[var(--accent)]">
          ← Products
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
          {isEdit ? "Edit product" : "Add product"}
        </h1>
      </div>

      <form
        className="space-y-5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-6"
        onSubmit={handleSubmit(async (values) => {
          setSubmitting(true);
          try {
            const payload = toPayload(values);
            if (isEdit && productId) {
              await updateSellerProduct(productId, payload);
              toast("Product updated", "success");
            } else {
              await createSellerProduct(payload);
              toast("Product created", "success");
            }
            router.push("/studio/products");
          } catch (error) {
            toast(error instanceof Error ? error.message : "Save failed", "error");
          } finally {
            setSubmitting(false);
          }
        })}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <input className={inputClass} {...register("name")} />
          </Field>
          <Field label="Slug" error={errors.slug?.message}>
            <input className={inputClass} {...register("slug")} placeholder="amber-stoneware-vase" />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            {categories.length === 0 ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                No active categories yet.{" "}
                <Link href="/studio/categories" className="underline">
                  Add a category
                </Link>{" "}
                first.
              </p>
            ) : (
              <select className={inputClass} {...register("category")}>
                <option value="">Select category…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Price (ETB)" error={errors.priceEtb?.message}>
            <input type="number" className={inputClass} {...register("priceEtb", { valueAsNumber: true })} />
          </Field>
          {!isEdit ? (
            <Field label="Custom ID (optional)" error={errors.id?.message}>
              <input className={inputClass} {...register("id")} placeholder="vase-amber-01" />
            </Field>
          ) : null}
          <Field label="Max quantity" error={errors.maxQuantity?.message}>
            <input type="number" className={inputClass} {...register("maxQuantity", { valueAsNumber: true })} />
          </Field>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <textarea rows={5} className={inputClass} {...register("description")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Materials" error={errors.materials?.message}>
            <input className={inputClass} {...register("materials")} />
          </Field>
          <Field label="Dimensions" error={errors.dimensions?.message}>
            <input className={inputClass} {...register("dimensions")} />
          </Field>
          <Field label="Care" error={errors.care?.message}>
            <input className={inputClass} {...register("care")} />
          </Field>
        </div>

        <Field label="Product images" error={errors.images?.message}>
          <div className="space-y-3">
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-8 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onPickFiles(e.dataTransfer.files);
              }}
            >
              <p className="text-sm text-[var(--muted)]">
                Drag and drop images here, or choose files (JPEG, PNG, WebP, GIF, SVG · max 5MB each)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                multiple
                className="sr-only"
                id="product-image-upload"
                disabled={uploading || images.length >= 12}
                onChange={(e) => void onPickFiles(e.target.files)}
              />
              <label htmlFor="product-image-upload">
                <span
                  className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm ${
                    uploading || images.length >= 12 ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  {uploading ? "Uploading…" : "Choose images"}
                </span>
              </label>
            </div>

            {images.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((src, index) => (
                  <li key={`${src}-${index}`} className="group relative overflow-hidden rounded-md border border-[var(--border)]">
                    <div className="relative aspect-square bg-[var(--bg)]">
                      <Image
                        src={resolveMediaUrl(src)}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="160px"
                        unoptimized={src.startsWith("/uploads/")}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1.5 top-1.5 rounded bg-[var(--surface)]/95 px-2 py-1 text-xs text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Field>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setValue("available", e.target.checked, { shouldDirty: true })}
            />
            Available in shop
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setValue("featured", e.target.checked, { shouldDirty: true })}
            />
            Featured on home
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={submitting || uploading}>
            {isEdit ? "Save changes" : "Create product"}
          </Button>
          <Link
            href="/studio/products"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] px-5 py-2.5 text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm bg-[var(--bg)]";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm">{label}</label>
      {children}
      {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
