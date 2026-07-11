import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            {siteConfig.brandName}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Handmade flower vases and baskets by {siteConfig.makerName}.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--ink)]">Pay in person</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            No online payments. Order here, then pay when you pick up.
          </p>
        </div>
        <div className="text-sm text-[var(--muted)]">
          <p>
            <a
              className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              href={`tel:${siteConfig.sellerPhone}`}
            >
              {siteConfig.sellerPhone}
            </a>
          </p>
          <p className="mt-1">
            <a
              className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              href={`mailto:${siteConfig.sellerEmail}`}
            >
              {siteConfig.sellerEmail}
            </a>
          </p>
          <p className="mt-3 text-xs">
            <Link href="/contact" className="underline-offset-2 hover:underline">
              Contact &amp; pickup
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} {siteConfig.brandName}. Privacy: we only use your details to fulfill your order.
      </div>
    </footer>
  );
}
