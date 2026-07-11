import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/site/BrandMark";
import { siteConfig } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero/atelier.svg"
          alt="Handmade vases and baskets in soft natural light"
          fill
          priority
          className="object-cover animate-hero-ken"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[var(--bg)]/55 md:bg-[var(--bg)]/40" />
      </div>
      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 md:justify-center md:pb-24">
        <BrandMark size="hero" asLink={false} />
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
          by {siteConfig.makerName}
        </p>
        <h1 className="mt-8 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--ink)] sm:text-4xl md:text-5xl">
          Handmade vessels for flowers, and baskets for everyday beauty.
        </h1>
        <p className="mt-4 max-w-md text-base text-[var(--muted)] sm:text-lg">
          Browse Aman Shop, place an order, and pay in person when you pick up.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop/vases"
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[#355f4e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Shop vases
          </Link>
          <Link
            href="/shop/baskets"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)]/90 px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Shop baskets
          </Link>
        </div>
      </div>
    </section>
  );
}
