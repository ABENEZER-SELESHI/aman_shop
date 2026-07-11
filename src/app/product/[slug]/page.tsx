import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { ProductGallery } from "@/components/product/ProductGallery";
import { formatEtb } from "@/lib/money";
import { getProductBySlug, getProducts } from "@/lib/products";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description.slice(0, 140),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const paragraphs = product.description.split("\n\n");

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <ProductGallery images={product.images} name={product.name} />
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">
          {product.category === "vase" ? "Vase" : "Basket"}
        </p>
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
        <div className="mt-8">
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
