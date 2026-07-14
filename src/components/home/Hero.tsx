import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/site/BrandMark";
import { siteConfig } from "@/lib/config";
import { getCategories } from "@/lib/products";

const HERO_IMAGE = "/hero/atelier.jpg";

export async function Hero() {
  const categories = await getCategories();
  const primary = categories[0];
  const secondary = categories[1];

  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-[var(--bg)]">
      {/* CSS background is the reliable paint layer; next/image enhances when it loads. */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-[center_40%]"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        aria-hidden
      >
        <Image
          src={HERO_IMAGE}
          alt="Handmade ceramic vases and woven baskets in soft morning light"
          fill
          priority
          className="object-cover object-[center_40%] animate-hero-ken"
          sizes="100vw"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[var(--bg)]/85 via-[var(--bg)]/45 to-[var(--bg)]/25 md:bg-gradient-to-r md:from-[var(--bg)]/80 md:via-[var(--bg)]/35 md:to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 md:justify-center md:pb-24">
        <BrandMark size="hero" asLink={false} />
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
          by {siteConfig.makerName}
        </p>
        <h1 className="mt-8 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--ink)] sm:text-4xl md:text-5xl">
          Handmade pieces for a quieter home.
        </h1>
        <p className="mt-4 max-w-md text-base text-[var(--muted)] sm:text-lg">
          Browse Aman Shop, place an order, and pay in person when you pick up.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {primary ? (
            <Link
              href={`/shop/${primary.slug}`}
              className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[#355f4e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Shop {primary.name.toLowerCase()}
            </Link>
          ) : (
            <Link
              href="/shop"
              className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[#355f4e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Browse shop
            </Link>
          )}
          {secondary ? (
            <Link
              href={`/shop/${secondary.slug}`}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)]/90 px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Shop {secondary.name.toLowerCase()}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
