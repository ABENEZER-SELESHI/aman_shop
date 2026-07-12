import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: `The story of ${siteConfig.makerName} and Aman Shop.`,
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        About {siteConfig.makerName}
      </h1>
      <div className="mt-8 space-y-5 text-[var(--muted)] leading-relaxed">
        <p>
          {siteConfig.makerName} makes flower vases and baskets by hand — quiet objects meant for
          everyday homes. Aman Shop is the place to see the current pieces and request an order.
        </p>
        <p>
          Clay is thrown and finished slowly. Baskets are coiled and woven from natural fibers.
          Materials are chosen for how they feel in the hand and how they live with soft light.
        </p>
        <p>
          Because each piece is handmade, no two are identical. Small differences in glaze, weave,
          and form are expected — they are part of the craft, not mistakes.
        </p>
        <p>
          When you order, you are sending a request. {siteConfig.makerName} will confirm pickup, and
          you pay in person when you collect.
        </p>
      </div>
      <Link
        href="/shop"
        className="mt-10 inline-block rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      >
        Shop the collection
      </Link>
    </article>
  );
}
