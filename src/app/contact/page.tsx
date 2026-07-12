import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { whatsappUrl } from "@/lib/phone";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Aman Shop for orders and pickup.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">Contact</h1>
      <p className="mt-3 text-[var(--muted)]">
        Questions about a piece or pickup? Reach {siteConfig.makerName} directly.
      </p>
      <dl className="mt-10 space-y-6 text-sm">
        <div>
          <dt className="text-[var(--muted)]">Phone</dt>
          <dd>
            <a
              href={`tel:${siteConfig.sellerPhone}`}
              className="text-lg text-[var(--ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              {siteConfig.sellerPhone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">WhatsApp</dt>
          <dd>
            <a
              href={whatsappUrl(siteConfig.sellerWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-[var(--ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              Message on WhatsApp
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Email</dt>
          <dd>
            <a
              href={`mailto:${siteConfig.sellerEmail}`}
              className="text-lg text-[var(--ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              {siteConfig.sellerEmail}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Pickup</dt>
          <dd className="text-lg text-[var(--ink)]">{siteConfig.pickupNote}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Hours</dt>
          <dd className="text-lg text-[var(--ink)]">By appointment</dd>
        </div>
      </dl>
    </div>
  );
}
