import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatEtb } from "@/lib/money";
import { getProductBySlug, getProducts } from "@/lib/products";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description.slice(0, 140),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const paragraphs = product.description.split("\n\n");
  const categoryHref = `/shop/${product.category}`;
  const categoryLabel = product.categoryName ?? product.category;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
          { href: categoryHref, label: categoryLabel },
          { label: product.name },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">{categoryLabel}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
            {product.name}
          </h1>
          <p className="mt-3 text-xl text-[var(--ink)]">{formatEtb(product.priceEtb)}</p>
          <div className="mt-6 space-y-3 text-[var(--muted)]">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <dl className="mt-8 space-y-3 border-t border-[var(--border)] pt-6 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Materials</dt>
              <dd className="text-[var(--ink)]">{product.materials}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Dimensions</dt>
              <dd className="text-[var(--ink)]">{product.dimensions}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Care</dt>
              <dd className="text-[var(--ink)]">{product.care}</dd>
            </div>
          </dl>
          <div className="mt-8 border-t border-[var(--border)] pt-6 lg:border-0 lg:pt-0">
            <div className="sticky bottom-0 z-20 -mx-4 bg-[var(--bg)]/95 px-4 py-4 backdrop-blur-sm lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <AddToCartForm product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
