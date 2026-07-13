import Link from "next/link";
import { CategoryPaths } from "@/components/home/CategoryPaths";
import { FeaturedStrip } from "@/components/home/FeaturedStrip";
import { Hero } from "@/components/home/Hero";
import { HowOrderingWorks } from "@/components/home/HowOrderingWorks";
import { getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/config";

export default async function HomePage() {
  const featured = (await getProducts({ featuredOnly: true })).slice(0, 6);

  return (
    <>
      <Hero />
      <FeaturedStrip products={featured} />
      <CategoryPaths />
      <HowOrderingWorks />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Made by {siteConfig.makerName}
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Each vase and basket is shaped by hand. Slight variations in tone, weave, and form are
          part of the piece — not flaws.
        </p>
        <Link
          href="/about"
          className="mt-6 inline-block text-sm text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          Read Amanuel&apos;s story
        </Link>
      </section>
    </>
  );
}
