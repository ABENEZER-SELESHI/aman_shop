"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createSellerCategory,
  deleteSellerCategory,
  fetchSellerCategories,
  updateSellerCategory,
} from "@/services/studio";
import type { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export default function StudioCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setCategories(await fetchSellerCategories());
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Add shop categories first (for example Chairs), then create products in that category.
        </p>
      </div>

      <form
        className="space-y-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          try {
            await createSellerCategory({
              name: name.trim(),
              slug: slug.trim() || undefined,
              description: description.trim() || undefined,
              sortOrder: categories.length + 1,
              isActive: true,
            });
            toast("Category created", "success");
            setName("");
            setSlug("");
            setDescription("");
            await load();
          } catch (error) {
            toast(error instanceof Error ? error.message : "Could not create category", "error");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <h2 className="font-[family-name:var(--font-display)] text-xl">Add category</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block">Name</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === slugify(name)) {
                  setSlug(slugify(e.target.value));
                }
              }}
              placeholder="Chairs"
              required
              minLength={2}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block">Slug (URL)</span>
            <input
              className={inputClass}
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="chairs"
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block">Description (optional)</span>
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Handcrafted seating for the home"
          />
        </label>
        <Button type="submit" loading={submitting}>
          Add category
        </Button>
      </form>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : categories.length === 0 ? (
        <p className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
          No categories yet. Add your first one above.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{category.name}</p>
                    {category.description ? (
                      <p className="text-xs text-[var(--muted)]">{category.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/shop/${category.slug}`} className="text-[var(--accent)]">
                      /shop/{category.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{category.productCount ?? 0}</td>
                  <td className="px-4 py-3">{category.isActive ? "Active" : "Hidden"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-0 px-3 py-1.5 text-xs"
                        onClick={async () => {
                          try {
                            await updateSellerCategory(category.id, { isActive: !category.isActive });
                            toast(category.isActive ? "Category hidden" : "Category visible", "success");
                            await load();
                          } catch (error) {
                            toast(error instanceof Error ? error.message : "Update failed", "error");
                          }
                        }}
                      >
                        {category.isActive ? "Hide" : "Show"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-0 px-3 py-1.5 text-xs text-red-700"
                        loading={deletingId === category.id}
                        onClick={async () => {
                          if (!window.confirm(`Delete category “${category.name}”?`)) return;
                          setDeletingId(category.id);
                          try {
                            await deleteSellerCategory(category.id);
                            toast("Category deleted", "success");
                            await load();
                          } catch (error) {
                            toast(error instanceof Error ? error.message : "Delete failed", "error");
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm bg-[var(--bg)]";
