import type { Metadata } from "next";
import Link from "next/link";
import { CopyReferenceButton } from "@/components/order/CopyReferenceButton";
import { ConfirmedOrderStatus } from "@/components/order/ConfirmedOrderStatus";
import { siteConfig } from "@/lib/config";
import { whatsappUrl } from "@/lib/phone";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `Order ${orderId}` };
}

export default async function OrderConfirmedPage({ params }: PageProps) {
  const { orderId } = await params;
  const waText = `Hi Amanuel — I just placed order ${orderId} on Aman Shop.`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">Order received</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Thank you
        </h1>
        <p className="mt-4 text-[var(--muted)]">
          Your order reference is{" "}
          <span className="font-medium text-[var(--ink)]">{orderId}</span>.
        </p>
        <CopyReferenceButton reference={orderId} />
        <p className="mt-4 text-sm text-[var(--muted)]">
          Save this code — use it anytime on{" "}
          <Link
            href={`/order/track?ref=${encodeURIComponent(orderId)}`}
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Track order
          </Link>
          .
        </p>
      </div>

      <ConfirmedOrderStatus reference={orderId} />

      <div className="mt-8 rounded-md border border-[var(--accent-soft)] bg-[var(--accent-soft)]/30 px-5 py-4 text-left text-sm text-[var(--ink)]">
        <p className="font-medium">What happens next</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[var(--muted)]">
          <li>{siteConfig.makerName} will contact you to confirm details.</li>
          <li>Agree a pickup time ({siteConfig.pickupNote}).</li>
          <li>Pay in person when you collect your order — nothing is charged online.</li>
        </ol>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={whatsappUrl(siteConfig.sellerWhatsapp, waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[#355f4e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          WhatsApp {siteConfig.makerName}
        </a>
        <Link
          href={`/order/track?ref=${encodeURIComponent(orderId)}`}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          Track this order
        </Link>
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          Back to shop
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
