import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Submit an order request — pay in person at pickup.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        Order request
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Tell us how to reach you. Payment happens in person when you pick up.
      </p>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
